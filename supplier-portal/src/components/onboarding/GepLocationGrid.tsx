import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, 
  Plus, 
  Trash2, 
  Edit3, 
  MapPin, 
  X, 
  Phone,
  FileText,
  ChevronDown,
  Paperclip,
  Eye,
  RefreshCw,
  UploadCloud,
  Check,
  Globe
} from 'lucide-react';
import { GepLocationItem, GepLocationType } from '../../types/index.js';
import { DocumentPreviewModal, ComplianceDoc } from '../common/DocumentPreviewModal.js';
import { SearchableSelect } from '../common/SearchableSelect.js';

interface GepLocationGridProps {
  locations: GepLocationItem[];
  onChange: (locations: GepLocationItem[]) => void;
  readOnly?: boolean;
  openAddTrigger?: number;
}

const LOCATION_TYPE_LABELS: Record<GepLocationType, { label: string; desc: string }> = {
  HQ: { label: 'Headquarters', desc: 'Principal corporate executive office & registered jurisdiction' },
  REMIT_TO: { label: 'Remit-To (Payment)', desc: 'Authorized destination for EFT/ACH disbursements & checks' },
  ORDERING: { label: 'Ordering / PO Intake', desc: 'Designated endpoint for electronic purchase order dispatches' },
  INVOICING: { label: 'Invoicing Entity', desc: 'Billing entity name & corporate tax jurisdiction on invoices' },
  SHIP_FROM: { label: 'Ship-From / Fulfillment', desc: 'Origin warehouse or manufacturing dock dispatching goods' }
};

const STANDARD_COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'Australia',
  'Singapore',
  'Mexico',
  'Switzerland'
];

export const GepLocationGrid: React.FC<GepLocationGridProps> = ({
  locations,
  onChange,
  readOnly = false,
  openAddTrigger
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<GepLocationItem | null>(null);

  // Form State in Modal
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formTypes, setFormTypes] = useState<GepLocationType[]>(['ORDERING', 'REMIT_TO']);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [formStreet1, setFormStreet1] = useState('');
  const [formStreet2, setFormStreet2] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formZip, setFormZip] = useState('');
  const [formCountry, setFormCountry] = useState('United States');
  const [formPhone, setFormPhone] = useState('');
  const [formChangeOrder, setFormChangeOrder] = useState(true);
  const [formAutoAck, setFormAutoAck] = useState(true);

  // Attachment & Document Preview State
  const [formDocFileName, setFormDocFileName] = useState<string | null>(null);
  const [formDocFileSize, setFormDocFileSize] = useState<string | null>(null);
  const [isReplaced, setIsReplaced] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formPreviewBlobUrl, setFormPreviewBlobUrl] = useState<string | undefined>(undefined);
  const [previewDoc, setPreviewDoc] = useState<ComplianceDoc | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Close type dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    if (typeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [typeDropdownOpen]);

  const handleOpenAdd = () => {
    setEditingLocation(null);
    setFormName('');
    setFormCode(`LOC-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormTypes(['ORDERING', 'REMIT_TO']);
    setTypeDropdownOpen(false);
    setFormStreet1('');
    setFormStreet2('');
    setFormCity('');
    setFormState('');
    setFormZip('');
    setFormCountry('United States');
    setFormPhone('');
    setFormChangeOrder(true);
    setFormAutoAck(true);
    setFormDocFileName(null);
    setFormDocFileSize(null);
    setIsReplaced(false);
    setFormPreviewBlobUrl(undefined);
    setFormError(null);
    setModalOpen(true);
  };

  // Only respond to new click triggers, never auto-open on initial mount or section navigation
  const prevTriggerRef = useRef(openAddTrigger);
  useEffect(() => {
    if (openAddTrigger && openAddTrigger > 0 && openAddTrigger !== prevTriggerRef.current) {
      handleOpenAdd();
    }
    prevTriggerRef.current = openAddTrigger;
  }, [openAddTrigger]);

  const handleOpenEdit = (loc: GepLocationItem) => {
    setEditingLocation(loc);
    setFormName(loc.name);
    setFormCode(loc.code);
    setFormTypes(loc.types);
    setTypeDropdownOpen(false);
    setFormStreet1(loc.street1);
    setFormStreet2(loc.street2 || '');
    setFormCity(loc.city);
    setFormState(loc.state);
    setFormZip(loc.zip);
    setFormCountry(loc.country || 'United States');
    setFormPhone(loc.phone || '');
    setFormChangeOrder(loc.changeOrdersPermitted);
    setFormAutoAck(loc.autoAcknowledge);
    setFormDocFileName(loc.docFileName || null);
    setFormDocFileSize(loc.docFileSize || null);
    setIsReplaced(Boolean(loc.isReplaced));
    setFormPreviewBlobUrl(loc.previewUrl);
    setFormError(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    onChange(locations.filter(l => l.id !== id));
  };

  const handleToggleType = (type: GepLocationType) => {
    if (formTypes.includes(type)) {
      if (formTypes.length > 1) {
        setFormTypes(formTypes.filter(t => t !== type));
      }
    } else {
      setFormTypes([...formTypes, type]);
    }
  };

  const handleProcessFile = (fileInfo: { name: string; size: string }) => {
    setIsUploading(true);
    setTimeout(() => {
      setFormDocFileName(fileInfo.name);
      setFormDocFileSize(fileInfo.size);
      setIsUploading(false);
    }, 350);
  };

  const handleTriggerReplace = () => {
    setIsReplaced(true);
    replaceFileInputRef.current?.click();
  };

  // Preview an attached document in DocumentPreviewModal
  const handlePreviewDocument = (loc: GepLocationItem) => {
    const fn = loc.docFileName || `${loc.name.replace(/\s+/g, '_')}_Address_Proof.pdf`;
    setPreviewDoc({
      id: `doc-${loc.id}`,
      title: `${loc.name} — Facility Proof of Address & Operating Mandate`,
      type: 'PROOF_OF_ADDRESS',
      issuedDate: '2026-01-01',
      expiryDate: '2027-12-31',
      daysRemaining: 365,
      status: 'ACTIVE',
      fileSize: loc.docFileSize || '1.4 MB',
      verifiedBy: 'Corporate Facility Governance & USPS Validation',
      documentCategory: 'FACILITY_AND_LOGISTICS',
      previewUrl: loc.previewUrl
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formStreet1.trim() || !formCity.trim() || !formZip.trim()) {
      setFormError('Location Name, Street Address 1, City and Zip / Postal Code are required.');
      return;
    }

    if (formTypes.length === 0) {
      setFormError('Please select at least one Location Operational Type.');
      return;
    }

    if (editingLocation) {
      onChange(locations.map(l => {
        if (l.id === editingLocation.id) {
          return {
            ...l,
            name: formName.trim(),
            types: formTypes,
            street1: formStreet1.trim(),
            street2: formStreet2.trim() || undefined,
            city: formCity.trim(),
            state: formState.trim(),
            zip: formZip.trim(),
            country: formCountry,
            phone: formPhone.trim() || undefined,
            changeOrdersPermitted: formChangeOrder,
            autoAcknowledge: formAutoAck,
            docFileName: formDocFileName || (editingLocation ? editingLocation.docFileName : undefined),
            docFileSize: formDocFileName ? (formDocFileSize || '1.4 MB') : editingLocation?.docFileSize,
            isReplaced: isReplaced || l.isReplaced,
            previewUrl: formPreviewBlobUrl || l.previewUrl
          };
        }
        return l;
      }));
    } else {
      const newLoc: GepLocationItem = {
        id: `loc-${Date.now()}`,
        name: formName.trim(),
        code: formCode,
        types: formTypes,
        street1: formStreet1.trim(),
        street2: formStreet2.trim() || undefined,
        city: formCity.trim(),
        state: formState.trim(),
        zip: formZip.trim(),
        country: formCountry,
        phone: formPhone.trim() || undefined,
        changeOrdersPermitted: formChangeOrder,
        autoAcknowledge: formAutoAck,
        supportedCurrencies: ['USD'],
        docFileName: formDocFileName || undefined,
        docFileSize: formDocFileName ? (formDocFileSize || '1.4 MB') : undefined,
        isReplaced: false,
        previewUrl: formPreviewBlobUrl
      };
      onChange([...locations, newLoc]);
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-3.5">
      {/* Locations Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Location Name & Code</th>
                <th className="py-2.5 px-3">Assigned Role Types</th>
                <th className="py-2.5 px-3">Full Address</th>
                <th className="py-2.5 px-3">Supporting Document</th>
                <th className="py-2.5 px-3 text-center">Auto-Ack</th>
                <th className="py-2.5 px-3">Phone</th>
                {!readOnly && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={readOnly ? 6 : 7} className="py-8 text-center text-slate-400">
                    <p className="text-xs">No operating locations or facilities registered yet. Click &quot;+ Add Location&quot; above to configure ship-from, ordering, or remit sites.</p>
                  </td>
                </tr>
              ) : (
                locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-900 text-xs">{loc.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{loc.code}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {loc.types.map((t) => {
                        const cfg = LOCATION_TYPE_LABELS[t];
                        return (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[11px] font-normal bg-slate-100 text-slate-600 border border-slate-200">
                            {cfg ? cfg.label : t}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-600 font-normal">
                    <div>{loc.street1} {loc.street2 && `• ${loc.street2}`}</div>
                    <div className="text-slate-500">{loc.city}, {loc.state} {loc.zip}, {loc.country}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    {loc.docFileName ? (
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handlePreviewDocument(loc)}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition cursor-pointer group max-w-[190px]"
                          title="Click to preview facility proof of address"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                          <span className="truncate group-hover:underline text-[11px] font-mono text-slate-700 group-hover:text-emerald-800">
                            {loc.docFileName}
                          </span>
                          <Eye className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </button>
                        {loc.isReplaced && (
                          <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-medium">
                            Resubmitted
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Not attached</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-xs text-slate-600 font-normal">
                      {loc.autoAcknowledge ? 'Enabled' : 'Manual'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {loc.phone || '—'}
                  </td>
                  {!readOnly && (
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(loc)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                          title="Edit Location"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(loc.id)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Location"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Location Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="text-xs font-bold tracking-tight">
                  {editingLocation ? 'Edit Operating Location' : 'Add Corporate Facility / Location'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Enter facility address details, assigned role types, and proof of address.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {formError}
                </div>
              )}

              {/* Location Name & Code */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Location Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Austin Regional HQ"
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Location Code
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    readOnly
                    className="w-full px-3 py-2 text-xs font-mono font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                  />
                </div>
              </div>

              {/* LOCATION OPERATIONAL TYPES DROPDOWN (UPGRADED FROM MULTI-BUTTON GRID) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Location Operational Types <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formTypes.length} selected
                  </span>
                </div>

                <div className="relative" ref={typeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer min-h-[38px] transition"
                  >
                    <div className="flex flex-wrap gap-1 items-center">
                      {formTypes.length === 0 ? (
                        <span className="text-slate-400">Select operational types...</span>
                      ) : (
                        formTypes.map(t => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-normal"
                          >
                            <span>{LOCATION_TYPE_LABELS[t]?.label || t}</span>
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleType(t);
                              }}
                              className="hover:text-rose-600 cursor-pointer font-bold ml-0.5"
                              title="Remove"
                            >
                              ×
                            </span>
                          </span>
                        ))
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5 transition-transform duration-150 ${typeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Multi-Select Dropdown Menu */}
                  {typeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-0.5 animate-in fade-in duration-100 max-h-56 overflow-y-auto">
                      {(Object.keys(LOCATION_TYPE_LABELS) as GepLocationType[]).map((t) => {
                        const cfg = LOCATION_TYPE_LABELS[t];
                        const isSelected = formTypes.includes(t);
                        return (
                          <div
                            key={t}
                            onClick={() => handleToggleType(t)}
                            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                              isSelected ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <div className="font-medium text-slate-800">{cfg.label}</div>
                              <div className="text-[10px] text-slate-400">{cfg.desc}</div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 shrink-0 ml-2" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Facility Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +1 (512) 555-0100"
                    className="w-full pl-8 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Street Address 1 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formStreet1}
                    onChange={(e) => setFormStreet1(e.target.value)}
                    placeholder="100 Industrial Parkway"
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Street Address 2 (Suite / Building)
                  </label>
                  <input
                    type="text"
                    value={formStreet2}
                    onChange={(e) => setFormStreet2(e.target.value)}
                    placeholder="Suite 400 / Building B"
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="Austin"
                      className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      placeholder="TX"
                      className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Zip / Postal <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formZip}
                      onChange={(e) => setFormZip(e.target.value)}
                      placeholder="78701"
                      className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Country
                    </label>
                    <SearchableSelect
                      value={formCountry}
                      onChange={(val) => setFormCountry(val)}
                      placeholder="Select Country..."
                      searchPlaceholder="Search country..."
                      options={STANDARD_COUNTRIES}
                    />
                  </div>
                </div>
              </div>

              {/* Operational Checkboxes */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formChangeOrder}
                    onChange={(e) => setFormChangeOrder(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Change Orders Permitted for this Location</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAutoAck}
                    onChange={(e) => setFormAutoAck(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Auto-Acknowledge Electronic Purchase Orders</span>
                </label>
              </div>

              {/* SUPPORTING FACILITY DOCUMENT / PROOF OF ADDRESS (UPLOAD FEATURE) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>Supporting Facility Document / Proof of Address</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">PDF, PNG, JPG (max 25MB)</span>
                </div>

                {/* Hidden Native File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormPreviewBlobUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
                      handleProcessFile({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                    }
                  }}
                />
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormPreviewBlobUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
                      handleProcessFile({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                    }
                  }}
                />

                {isUploading && (
                  <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center space-x-2 text-xs text-slate-700 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-600" />
                    <span>Processing & validating facility address proof...</span>
                  </div>
                )}

                {!isUploading && formDocFileName && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                          <FileText className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {formDocFileName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {formDocFileSize || '1.4 MB'} • Verified
                          </div>
                        </div>
                      </div>

                      {isReplaced && (
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-medium shrink-0">
                          Resubmitted
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewDoc({
                            id: 'temp-preview',
                            title: `${formName || 'Facility'} — Proof of Address`,
                            type: 'PROOF_OF_ADDRESS',
                            issuedDate: '2026-01-01',
                            expiryDate: '2027-12-31',
                            daysRemaining: 365,
                            status: 'ACTIVE',
                            fileSize: formDocFileSize || '1.4 MB',
                            verifiedBy: 'Corporate Facility Governance',
                            documentCategory: 'FACILITY_AND_LOGISTICS',
                            previewUrl: formPreviewBlobUrl
                          });
                        }}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Preview</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleTriggerReplace}
                          className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition flex items-center space-x-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-400" />
                          <span>Replace</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormDocFileName(null);
                            setFormDocFileSize(null);
                          }}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove Attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!isUploading && !formDocFileName && (
                  <div className="space-y-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setFormPreviewBlobUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined);
                          handleProcessFile({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
                        }
                      }}
                      className="p-4 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition text-center cursor-pointer group"
                    >
                      <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-slate-600 mx-auto mb-1 transition-transform group-hover:scale-105" />
                      <p className="text-xs font-semibold text-slate-800">
                        Click to browse or drag & drop facility proof document
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Lease agreement, utility bill, warehouse license, or address proof
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition cursor-pointer"
                >
                  {editingLocation ? 'Update Location' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal for viewing attachments */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onDownload={() => {}}
        />
      )}
    </div>
  );
};
