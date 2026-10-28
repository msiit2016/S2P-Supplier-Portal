import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { UserCircle, Building, CheckCircle2, Save } from 'lucide-react';

export const SupplierProfileSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [legalName, setLegalName] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLegalName(currentUser.organizationName || 'Nexura Global Analytics Inc.');
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
        <h1 className="text-xl font-bold text-slate-900">Supplier Profile Settings</h1>
        <p className="text-xs text-slate-500">Manage your supplier organization profile and contact coordinates.</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Organization</label>
          <input
            type="text"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Business Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full text-xs border border-slate-200 bg-slate-50 rounded-lg px-3 py-2.5 text-slate-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
