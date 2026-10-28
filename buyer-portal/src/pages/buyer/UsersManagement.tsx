import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { User } from '../../types/index.js';
import { Users, Shield, Mail, CheckCircle2 } from 'lucide-react';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getDemoUsers();
      if (res.users) setUsers(res.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Procurement Team & RBAC Authorization
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Role-based permissions governing reviewer assignments, banking unmasking, and executive sign-off authority.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Organization</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Portal Scope</th>
              <th className="py-3 px-4">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{u.name}</div>
                  <div className="text-[11px] text-slate-400">{u.email}</div>
                </td>
                <td className="py-3 px-4 text-slate-700">{u.organizationName}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    u.role === 'BUYER_ADMIN' || u.role === 'BUYER_APPROVER'
                      ? 'bg-purple-100 text-purple-800'
                      : u.role === 'BUYER_REVIEWER'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">{u.userType}</td>
                <td className="py-3 px-4">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
