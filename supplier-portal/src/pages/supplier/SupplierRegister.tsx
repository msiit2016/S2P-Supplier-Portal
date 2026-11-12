import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ApiClient } from '../../api/client.js';
import { VerisourceLogo } from '../../components/common/VerisourceLogo.js';
import { ShieldCheck, ArrowRight, UserPlus, AlertTriangle } from 'lucide-react';

export const SupplierRegister: React.FC = () => {
  const { navigate, setPortal } = usePortal();
  const { switchUser } = useAuth();
  
  const [legalName, setLegalName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [country, setCountry] = useState('United States');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await ApiClient.registerSupplier({
        legalName,
        businessEmail,
        contactName,
        country,
        password
      });

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        alert('Account successfully created! Verification confirmed.');
        setPortal('SUPPLIER');
        navigate('/onboarding');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="flex justify-center mb-4">
          <VerisourceLogo size="lg" theme="light" variant="stacked" showTagline={true} taglineText="Autonomous Supplier Network" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Supplier Account</h2>
        <p className="text-xs text-slate-500">Register your organization on the Verisource Multi-Enterprise Network</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Apex Industrial Solutions Inc."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Contact Full Name</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Sarah Miller"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Business Email</label>
              <input
                type="email"
                required
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Country of Incorporation</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="Japan">Japan</option>
                <option value="India">India</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Create Secure Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              {loading ? 'Creating Account...' : 'Register & Start Onboarding'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
              >
                Already registered? Sign In →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
