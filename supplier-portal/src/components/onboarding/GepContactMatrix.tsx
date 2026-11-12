import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Mail, 
  Phone, 
  ShieldCheck, 
  X, 
  Copy, 
  Building2, 
  ChevronDown,
  Paperclip,
  Eye,
  RefreshCw,
  FileText,
  UploadCloud,
  Check,
  Briefcase,
  Globe
} from 'lucide-react';
import { GepContactItem, GepContactRole } from '../../types/index.js';
import { DocumentPreviewModal, ComplianceDoc } from '../common/DocumentPreviewModal.js';
import { SearchableSelect } from '../common/SearchableSelect.js';

interface GepContactMatrixProps {
  contacts: GepContactItem[];
  onChange: (contacts: GepContactItem[]) => void;
  readOnly?: boolean;
  openAddTrigger?: number;
}

const ROLE_DISPLAY_NAMES: Record<GepContactRole, { label: string; desc: string; badgeColor: string }> = {
  ACCOUNTS_PAYABLE: {
    label: 'Accounts Payable (AP)',
    desc: 'Receives remittances, payment advice & early discount offers',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  ACCOUNTS_RECEIVABLE: {
    label: 'Accounts Receivable (AR)',
    desc: 'Manages outgoing invoices, PO dispute resolution & billing inquiries',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  LEGAL: {
    label: 'Legal & Contracts Counsel',
    desc: 'Authorized to review and execute MSAs, NDAs & compliance terms',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  OPERATIONS: {
    label: 'Operations & Logistics',
    desc: 'Receives PO dispatches, issues ASNs and coordinates warehouse dock intake',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  COMPLIANCE: {
    label: 'Compliance & ESG Officer',
    desc: 'Attests to annual safety audits, ISO certifications & diversity status',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  GENERAL: {
    label: 'Corporate Executive / General',
    desc: 'Primary business relationship stakeholder',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

const STANDARD_ORG_ENTITIES = [
  'Corporate Headquarters',
  'Supply Chain Operations',
  'Corporate Legal & Contracts',
  'Risk, ESG & Safety',
  'Finance & Treasury Operations',
  'Global Operations',
  'Regional Logistics Facility'
];

export const GepContactMatrix: React.FC<GepContactMatrixProps> = ({
  contacts,
  onChange,
  readOnly = false,
  openAddTrigger
}) => {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'MAPPING'>('DIRECTORY');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<GepContactItem | null>(null);

  // Common Form State
  const [formFirst, setFormFirst] = useState('');
  const [formLast, setFormLast] = useState('');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<GepContactRole>('ACCOUNTS_PAYABLE');
  const [formIsPrimary, setFormIsPrimary] = useState(false);
  
  // Tab 2 (Role Governance & Mapping) Specific State
  const [formSelectedContactId, setFormSelectedContactId] = useState<string>('NEW');
  const [formOrgEntity, setFormOrgEntity] = useState('Supply Chain Operations');
  const [formResponsibilities, setFormResponsibilities] = useState('');
  const [formServiceLocation, setFormServiceLocation] = useState('Global Operations');

  // Document Upload & Preview State
  const [formDocFileName, setFormDocFileName] = useState<string | null>(null);
  const [formDocFileSize, setFormDocFileSize] = useState<string | null>(null);
  const [isReplaced, setIsReplaced] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formPreviewBlobUrl, setFormPreviewBlobUrl] = useState<string | undefined>(undefined);
  const [previewDoc, setPreviewDoc] = useState<ComplianceDoc | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Open modal tailored for Tab 1 (Contact Directory)
  const handleOpenAddContact = () => {
    setEditingContact(null);
    setFormFirst('');
    setFormLast('');
    setFormJobTitle('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('ACCOUNTS_PAYABLE');
    setFormIsPrimary(contacts.length === 0);
    setFormOrgEntity('Corporate Headquarters');
    setFormResponsibilities(ROLE_DISPLAY_NAMES.ACCOUNTS_PAYABLE.desc);
    setFormServiceLocation('Global Operations');
    setFormDocFileName(null);
    setFormDocFileSize(null);
    setIsReplaced(false);
    setFormPreviewBlobUrl(undefined);
    setFormError(null);
    setModalOpen(true);
  };

  // Open modal tailored for Tab 2 (Role Governance & Mapping)
  const handleOpenAddRoleMapping = () => {
    setEditingContact(null);
    if (contacts.length > 0) {
      const first = contacts[0];
      setFormSelectedContactId(first.id);
      setFormFirst(first.firstName);
      setFormLast(first.lastName);
      setFormJobTitle(first.jobTitle || '');
      setFormEmail(first.email);
      setFormPhone(first.phone || '');
      setFormRole(first.role);
      setFormIsPrimary(first.isPrimary);
      setFormOrgEntity(first.orgEntity || 'Corporate Headquarters');
      setFormResponsibilities(first.responsibilities || (ROLE_DISPLAY_NAMES[first.role]?.desc || ''));
      setFormServiceLocation(first.serviceLocation || 'Global Operations');
      setFormDocFileName(first.docFileName || null);
      setFormDocFileSize(first.docFileSize || null);
    } else {
      setFormSelectedContactId('NEW');
      setFormFirst('');
      setFormLast('');
      setFormJobTitle('');
      setFormEmail('');
      setFormPhone('');
      setFormRole('OPERATIONS');
      setFormIsPrimary(true);
      setFormOrgEntity('Supply Chain Operations');
      setFormResponsibilities(ROLE_DISPLAY_NAMES.OPERATIONS.desc);
      setFormServiceLocation('Global Operations');
      setFormDocFileName(null);
      setFormDocFileSize(null);
    }
    setIsReplaced(false);
    setFormPreviewBlobUrl(undefined);
    setFormError(null);
    setModalOpen(true);
  };

  // Only respond to new click triggers, tailored to active tab
  const prevTriggerRef = useRef(openAddTrigger);
  useEffect(() => {
    if (openAddTrigger && openAddTrigger > 0 && openAddTrigger !== prevTriggerRef.current) {
      if (activeTab === 'DIRECTORY') {
        handleOpenAddContact();
      } else {
        handleOpenAddRoleMapping();
      }
    }
    prevTriggerRef.current = openAddTrigger;
  }, [openAddTrigger, activeTab]);

  const handleOpenEdit = (contact: GepContactItem) => {
    setEditingContact(contact);
    setFormSelectedContactId(contact.id);
    setFormFirst(contact.firstName);
    setFormLast(contact.lastName);
    setFormJobTitle(contact.jobTitle || '');
    setFormEmail(contact.email);
    setFormPhone(contact.phone || '');
    setFormRole(contact.role);
    setFormIsPrimary(contact.isPrimary);
    setFormOrgEntity(contact.orgEntity || 'Corporate Headquarters');
    setFormResponsibilities(contact.responsibilities || (ROLE_DISPLAY_NAMES[contact.role]?.desc || ''));
    setFormServiceLocation(contact.serviceLocation || 'Global Operations');
    setFormDocFileName(contact.docFileName || null);
    setFormDocFileSize(contact.docFileSize || null);
    setIsReplaced(Boolean(contact.isReplaced));
    setFormPreviewBlobUrl(contact.previewUrl);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSelectContactInMapping = (id: string) => {
    setFormSelectedContactId(id);
    if (id === 'NEW') {
      setFormFirst('');
      setFormLast('');
      setFormJobTitle('');
      setFormEmail('');
      setFormPhone('');
      setFormRole('OPERATIONS');
      setFormOrgEntity('Supply Chain Operations');
      setFormResponsibilities(ROLE_DISPLAY_NAMES.OPERATIONS.desc);
      setFormDocFileName(null);
      setFormDocFileSize(null);
    } else {
      const found = contacts.find(c => c.id === id);
      if (found) {
        setFormFirst(found.firstName);
        setFormLast(found.lastName);
        setFormJobTitle(found.jobTitle || '');
        setFormEmail(found.email);
        setFormPhone(found.phone || '');
        setFormRole(found.role);
        setFormOrgEntity(found.orgEntity || 'Corporate Headquarters');
        setFormResponsibilities(found.responsibilities || (ROLE_DISPLAY_NAMES[found.role]?.desc || ''));
        setFormServiceLocation(found.serviceLocation || 'Global Operations');
        setFormDocFileName(found.docFileName || null);
        setFormDocFileSize(found.docFileSize || null);
      }
    }
  };

  const handleChangeRoleInMapping = (newRole: GepContactRole) => {
    setFormRole(newRole);
    const defaultDesc = ROLE_DISPLAY_NAMES[newRole]?.desc || '';
    setFormResponsibilities(defaultDesc);
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

  const handleTogglePrimary = (id: string) => {
    onChange(contacts.map(c => ({
      ...c,
      isPrimary: c.id === id
    })));
  };

  const handleDelete = (id: string) => {
    const remaining = contacts.filter(c => c.id !== id);
    if (remaining.length > 0 && !remaining.some(c => c.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    onChange(remaining);
  };

  const handleClone = (contact: GepContactItem) => {
    const cloned: GepContactItem = {
      ...contact,
      id: `cnt-${Date.now()}`,
      isPrimary: false,
      role: 'OPERATIONS',
      status: 'INVITED',
      responsibilities: ROLE_DISPLAY_NAMES.OPERATIONS.desc,
      docFileName: contact.docFileName ? `Clone_${contact.docFileName}` : undefined
    };
    onChange([...contacts, cloned]);
  };

  // Preview an attached document in DocumentPreviewModal
  const handlePreviewDocument = (c: GepContactItem) => {
    const fn = c.docFileName || `${c.firstName}_${c.lastName}_Signatory_Authorization.pdf`;
    const roleCfg = ROLE_DISPLAY_NAMES[c.role] || ROLE_DISPLAY_NAMES.GENERAL;
    setPreviewDoc({
      id: `doc-${c.id}`,
      title: `${c.firstName} ${c.lastName} — ${roleCfg.label} Authorization Proof`,
      type: 'SIGNATORY_AUTHORIZATION',
      issuedDate: '2026-01-01',
      expiryDate: '2027-12-31',
      daysRemaining: 365,
      status: 'ACTIVE',
      fileSize: c.docFileSize || '1.4 MB',
      verifiedBy: 'Corporate Governance & Signatory Validation',
      documentCategory: 'GOVERNANCE_AND_CONTACTS',
      previewUrl: c.previewUrl
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirst.trim() || !formLast.trim() || !formEmail.trim()) {
      setFormError('First Name, Last Name, and Corporate Email Address are required.');
      return;
    }

    if (activeTab === 'DIRECTORY') {
      if (editingContact) {
        onChange(contacts.map(c => {
          if (c.id === editingContact.id) {
            return {
              ...c,
              firstName: formFirst.trim(),
              lastName: formLast.trim(),
              jobTitle: formJobTitle.trim() || undefined,
              email: formEmail.trim(),
              phone: formPhone.trim(),
              role: formRole,
              isPrimary: formIsPrimary,
              docFileName: formDocFileName || (editingContact ? editingContact.docFileName : undefined),
              docFileSize: formDocFileName ? (formDocFileSize || '1.2 MB') : editingContact?.docFileSize,
              isReplaced: isReplaced || c.isReplaced,
              previewUrl: formPreviewBlobUrl || c.previewUrl
            };
          }
          return formIsPrimary ? { ...c, isPrimary: false } : c;
        }));
      } else {
        const newContact: GepContactItem = {
          id: `cnt-${Date.now()}`,
          firstName: formFirst.trim(),
          lastName: formLast.trim(),
          jobTitle: formJobTitle.trim() || undefined,
          email: formEmail.trim(),
          phone: formPhone.trim(),
          role: formRole,
          isPrimary: formIsPrimary || contacts.length === 0,
          status: 'REGISTERED',
          orgEntity: 'Corporate Headquarters',
          serviceLocation: 'Americas',
          responsibilities: ROLE_DISPLAY_NAMES[formRole]?.desc,
          docFileName: formDocFileName || undefined,
          docFileSize: formDocFileName ? (formDocFileSize || '1.2 MB') : undefined,
          isReplaced: false,
          previewUrl: formPreviewBlobUrl
        };

        const updated = formIsPrimary 
          ? contacts.map(c => ({ ...c, isPrimary: false })) 
          : [...contacts];
        onChange([...updated, newContact]);
      }
    } else {
      // TAB 2: ROLE GOVERNANCE & MAPPING
      if (editingContact) {
        onChange(contacts.map(c => {
          if (c.id === editingContact.id) {
            return {
              ...c,
              role: formRole,
              orgEntity: formOrgEntity.trim() || 'Corporate Headquarters',
              responsibilities: formResponsibilities.trim() || ROLE_DISPLAY_NAMES[formRole]?.desc,
              serviceLocation: formServiceLocation.trim() || 'Global Operations',
              docFileName: formDocFileName || (editingContact ? editingContact.docFileName : undefined),
              docFileSize: formDocFileName ? (formDocFileSize || '1.4 MB') : editingContact?.docFileSize,
              isReplaced: isReplaced || c.isReplaced,
              previewUrl: formPreviewBlobUrl || c.previewUrl
            };
          }
          return c;
        }));
      } else if (formSelectedContactId !== 'NEW') {
        // Assign / update role on existing contact
        onChange(contacts.map(c => {
          if (c.id === formSelectedContactId) {
            return {
              ...c,
              role: formRole,
              orgEntity: formOrgEntity.trim() || 'Corporate Headquarters',
              responsibilities: formResponsibilities.trim() || ROLE_DISPLAY_NAMES[formRole]?.desc,
              serviceLocation: formServiceLocation.trim() || 'Global Operations',
              docFileName: formDocFileName || c.docFileName || undefined,
              docFileSize: formDocFileName ? (formDocFileSize || '1.4 MB') : c.docFileSize,
              isReplaced: isReplaced || c.isReplaced,
              previewUrl: formPreviewBlobUrl || c.previewUrl
            };
          }
          return c;
        }));
      } else {
        // Quick register new liaison with assigned role mapping
        const newContact: GepContactItem = {
          id: `cnt-${Date.now()}`,
          firstName: formFirst.trim(),
          lastName: formLast.trim(),
          jobTitle: formJobTitle.trim() || undefined,
          email: formEmail.trim(),
          phone: formPhone.trim(),
          role: formRole,
          isPrimary: contacts.length === 0,
          status: 'REGISTERED',
          orgEntity: formOrgEntity.trim() || 'Corporate Headquarters',
          responsibilities: formResponsibilities.trim() || ROLE_DISPLAY_NAMES[formRole]?.desc,
          serviceLocation: formServiceLocation.trim() || 'Global Operations',
          docFileName: formDocFileName || undefined,
          docFileSize: formDocFileName ? (formDocFileSize || '1.4 MB') : undefined,
          isReplaced: false,
          previewUrl: formPreviewBlobUrl
        };
        onChange([...contacts, newContact]);
      }
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-3.5">
      {/* Sub-Tabs: Clean enterprise typography */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('DIRECTORY')}
          className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'DIRECTORY'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Contact Directory
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MAPPING')}
          className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'MAPPING'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Role Governance & Mapping
        </button>
      </div>

      {/* TAB 1: CONTACT DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-center">Primary</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Role Designation</th>
                  <th className="py-2.5 px-3">Supporting Document</th>
                  <th className="py-2.5 px-3">Status</th>
                  {!readOnly && <th className="py-2.5 px-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={readOnly ? 7 : 8} className="py-8 text-center text-slate-400">
                      <p className="text-xs">No contact liaisons registered yet. Click &quot;+ Add Contact&quot; above to configure officers and representatives.</p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => {
                  const roleConfig = ROLE_DISPLAY_NAMES[contact.role] || ROLE_DISPLAY_NAMES.GENERAL;
                  return (
                    <tr key={contact.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 text-center">
                        {contact.isPrimary ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                            Primary
                          </span>
                        ) : !readOnly ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePrimary(contact.id)}
                            className="text-slate-400 hover:text-slate-700 text-[10px] font-medium cursor-pointer"
                          >
                            Set Primary
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900 text-xs">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.jobTitle && (
                          <div className="text-[10px] text-slate-500 font-normal">
                            {contact.jobTitle}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-600">
                        <a href={`mailto:${contact.email}`} className="hover:text-emerald-600 hover:underline">
                          {contact.email}
                        </a>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-600">
                        {contact.phone || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-slate-700 font-normal">
                          {roleConfig.label.split('(')[0].trim()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {contact.docFileName ? (
                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handlePreviewDocument(contact)}
                              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition cursor-pointer group max-w-[190px]"
                              title="Click to preview attached signatory proof"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                              <span className="truncate group-hover:underline text-[11px] font-mono text-slate-700 group-hover:text-emerald-800">
                                {contact.docFileName}
                              </span>
                              <Eye className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </button>
                            {contact.isReplaced && (
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-medium">
                                Resubmitted
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not attached</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-600 font-normal">
                          {contact.status}
                        </span>
                      </td>
                      {!readOnly && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(contact)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                              title="Edit Contact"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(contact.id)}
                              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Contact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE GOVERNANCE & MAPPING */}
      {activeTab === 'MAPPING' && (
        <div className="space-y-3">
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Contact Person</th>
                    <th className="py-2.5 px-3">Assigned P2P Persona Role</th>
                    <th className="py-2.5 px-3">Workflow Responsibilities</th>
                    <th className="py-2.5 px-3">Assigned Org Entity</th>
                    <th className="py-2.5 px-3">Delegation Proof</th>
                    {!readOnly && <th className="py-2.5 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan={readOnly ? 5 : 6} className="py-8 text-center text-slate-400">
                        <p className="text-xs">No role governance assignments configured yet. Add contacts above to configure P2P role responsibilities.</p>
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => {
                    const roleConfig = ROLE_DISPLAY_NAMES[contact.role] || ROLE_DISPLAY_NAMES.GENERAL;
                    return (
                      <tr key={contact.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900 text-xs">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {contact.email}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-xs text-slate-700 font-medium">
                            {roleConfig.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs font-normal">
                          {contact.responsibilities || roleConfig.desc}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 font-normal">
                          {contact.orgEntity || 'Corporate Headquarters'}
                        </td>
                        <td className="py-2.5 px-3">
                          {contact.docFileName ? (
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handlePreviewDocument(contact)}
                                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition cursor-pointer group max-w-[190px]"
                                title="Click to preview attached delegation proof"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                                <span className="truncate group-hover:underline text-[11px] font-mono text-slate-700 group-hover:text-emerald-800">
                                  {contact.docFileName}
                                </span>
                                <Eye className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                              </button>
                              {contact.isReplaced && (
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-medium">
                                  Resubmitted
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Not attached</span>
                          )}
                        </td>
                        {!readOnly && (
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                type="button"
                                onClick={() => handleClone(contact)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-700 transition cursor-pointer"
                                title="Clone to another role"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(contact)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
                                title="Edit Role Assignment"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(contact.id)}
                                className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                title="Delete Role Assignment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: DEDICATED TO TAB 1 (CONTACT DIRECTORY)
         ======================================================== */}
      {modalOpen && activeTab === 'DIRECTORY' && (
        <div className="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="text-xs font-bold tracking-tight">
                  {editingContact ? 'Edit Corporate Contact Liaison' : 'Add Corporate Contact Liaison'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Register corporate liaison and attach signatory authorization or business card proof.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
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

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formFirst}
                    onChange={(e) => setFormFirst(e.target.value)}
                    placeholder="e.g. Elena"
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formLast}
                    onChange={(e) => setFormLast(e.target.value)}
                    placeholder="e.g. Rostova"
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Job Title / Corporate Designation */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Job Title / Business Designation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    placeholder="e.g. VP Corporate Treasury & AP"
                    className="w-full pl-8 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Corporate Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Corporate Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. elena@acmeindustrial.com"
                    className="w-full pl-8 pr-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Business Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Business Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (512) 555-0199"
                    className="w-full pl-8 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Assigned Procurement Role */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Assigned Procurement Role (Persona) <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  value={formRole}
                  onChange={(val) => setFormRole(val as GepContactRole)}
                  placeholder="Select Procurement Role..."
                  options={Object.entries(ROLE_DISPLAY_NAMES).map(([roleKey, cfg]) => ({
                    value: roleKey,
                    label: cfg.label,
                    sublabel: cfg.desc
                  }))}
                />
              </div>

              {/* Primary Checkbox */}
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={formIsPrimary}
                  onChange={(e) => setFormIsPrimary(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Set as Primary Contact Liaison for this enterprise relationship</span>
              </label>

              {/* SUPPORTING VERIFICATION DOCUMENT ZONE (UPLOAD FEATURE) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>Supporting Verification Document</span>
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
                    <span>Processing & validating contact attachment...</span>
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
                            {formDocFileSize || '1.4 MB'} • Validated
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
                            title: `${formFirst} ${formLast} — Signatory Document`,
                            type: 'SIGNATORY_AUTHORIZATION',
                            issuedDate: '2026-01-01',
                            expiryDate: '2027-12-31',
                            daysRemaining: 365,
                            status: 'ACTIVE',
                            fileSize: formDocFileSize || '1.4 MB',
                            verifiedBy: 'Corporate Governance Registry',
                            documentCategory: 'GOVERNANCE_AND_CONTACTS',
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
                        Click to browse or drag & drop contact verification doc
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Authorized signatory proof, delegation letter, or business card scan
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
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
                  {editingContact ? 'Update Contact' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: DEDICATED TO TAB 2 (ROLE GOVERNANCE & MAPPING)
         ======================================================== */}
      {modalOpen && activeTab === 'MAPPING' && (
        <div className="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="text-xs font-bold tracking-tight">
                  {editingContact ? 'Edit Role Governance & Delegation Mapping' : 'Assign Role Governance & Mapping'}
                </div>
                <div className="text-[10px] text-slate-400">
                  Map procurement personas, operational responsibilities, and delegation mandates.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
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

              {/* Contact Person Selector */}
              {!editingContact ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Contact Person <span className="text-rose-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formSelectedContactId}
                    onChange={(val) => handleSelectContactInMapping(val)}
                    placeholder="Select Contact..."
                    searchPlaceholder="Search contact name or email..."
                    options={[
                      ...contacts.map(c => ({
                        value: c.id,
                        label: `${c.firstName} ${c.lastName}`,
                        sublabel: c.email
                      })),
                      { value: 'NEW', label: '+ Register New Contact Liaison...' }
                    ]}
                  />
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {formFirst} {formLast}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {formEmail} • {formJobTitle || 'Corporate Liaison'}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                    Active Liaison
                  </span>
                </div>
              )}

              {/* If "NEW" is selected in Add mode, allow entering contact info */}
              {!editingContact && formSelectedContactId === 'NEW' && (
                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formFirst}
                        onChange={(e) => setFormFirst(e.target.value)}
                        placeholder="e.g. Elena"
                        className="w-full px-3 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formLast}
                        onChange={(e) => setFormLast(e.target.value)}
                        placeholder="e.g. Rostova"
                        className="w-full px-3 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Corporate Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. elena@acmeindustrial.com"
                      className="w-full px-3 py-1.5 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Assigned P2P Persona Role */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Assigned P2P Persona Role <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  value={formRole}
                  onChange={(val) => handleChangeRoleInMapping(val as GepContactRole)}
                  placeholder="Select Procurement Role..."
                  options={Object.entries(ROLE_DISPLAY_NAMES).map(([roleKey, cfg]) => ({
                    value: roleKey,
                    label: cfg.label,
                    sublabel: cfg.desc
                  }))}
                />
              </div>

              {/* Assigned Org Entity / Division */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Assigned Org Entity / Division <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    list="org-entities-list"
                    value={formOrgEntity}
                    onChange={(e) => setFormOrgEntity(e.target.value)}
                    placeholder="e.g. Supply Chain Operations"
                    className="w-full pl-8 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <datalist id="org-entities-list">
                    {STANDARD_ORG_ENTITIES.map(ent => (
                      <option key={ent} value={ent} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Workflow Responsibilities & Scope */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Workflow Responsibilities & Delegation Scope <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formResponsibilities}
                  onChange={(e) => setFormResponsibilities(e.target.value)}
                  placeholder="e.g. Receives PO dispatches, issues ASNs and coordinates warehouse dock intake"
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Geographic / Operational Scope */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Geographic / Operational Scope
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formServiceLocation}
                    onChange={(e) => setFormServiceLocation(e.target.value)}
                    placeholder="e.g. Americas (US, CA, MX) or Global"
                    className="w-full pl-8 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* DELEGATION OF AUTHORITY / POWER OF ATTORNEY (UPLOAD FEATURE) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Delegation of Authority (DoA) / Mandate Proof</span>
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
                    <span>Validating delegation proof & mandate terms...</span>
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
                            {formDocFileSize || '1.8 MB'} • Formally Delegated
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
                            title: `Delegation Mandate — ${formFirst} ${formLast}`,
                            type: 'DELEGATION_MANDATE',
                            issuedDate: '2026-01-01',
                            expiryDate: '2027-12-31',
                            daysRemaining: 365,
                            status: 'ACTIVE',
                            fileSize: formDocFileSize || '1.8 MB',
                            verifiedBy: 'Corporate Governance Registry',
                            documentCategory: 'GOVERNANCE_AND_CONTACTS',
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
                        Click to browse or drag & drop delegation mandate proof
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Delegation of Authority (DoA), Power of Attorney, or executive mandate
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
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
                  {editingContact ? 'Update Role Assignment' : 'Save Role Assignment'}
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
