import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { OnboardingDocument } from '../../types/index.js';
import { Files, FileText, CheckCircle2, Clock, UploadCloud, ShieldCheck } from 'lucide-react';

export const SupplierDocuments: React.FC = () => {
  const { currentUser } = useAuth();
  const [docs, setDocs] = useState<OnboardingDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, [currentUser]);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const apps = await ApiClient.getApplications();
      if (apps.applications && apps.applications.length > 0) {
        const myApp = apps.applications.find((a: any) => a.supplierOrgId === currentUser?.organizationId) || apps.applications[0];
        const res = await ApiClient.getDocuments(myApp.id);
        if (res.documents) setDocs(res.documents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Supplier Document Vault
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Encrypted & Audited
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified tax certificates, liability insurance, and banking verification letters stored with tamper-evident checksums.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map(doc => (
          <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                doc.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {doc.verificationStatus}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 truncate">{doc.title}</h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {doc.docType} • {Math.round(doc.fileSize / 1024)} KB
              </p>
            </div>

            <div className="text-[10px] text-slate-400 font-mono truncate">
              SHA: {doc.checksum}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
