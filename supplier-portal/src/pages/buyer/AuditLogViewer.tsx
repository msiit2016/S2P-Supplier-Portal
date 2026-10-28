import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../api/client.js';
import { AuditEvent } from '../../types/index.js';
import { History, ShieldCheck, Filter, Search } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getAuditLogs();
      if (res.auditEvents) setEvents(res.auditEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = events.filter(e => 
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.actorName.toLowerCase().includes(search.toLowerCase()) ||
    e.entityId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Immutable Audit Trail
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Tamper-Evident Ledger
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Chronological record of every AI extraction, human verification, email transmission, and state transition.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by action, actor, or entity ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Entity Type</th>
              <th className="py-3 px-4">Entity ID</th>
              <th className="py-3 px-4">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(evt => (
              <tr key={evt.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                  {new Date(evt.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">{evt.action}</td>
                <td className="py-3 px-4">
                  <span className="font-semibold">{evt.actorName}</span>
                  <span className="block text-[10px] text-slate-400 font-mono">{evt.actorRole}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-mono">{evt.entityType}</span>
                </td>
                <td className="py-3 px-4 font-mono text-brand-600">{evt.entityId}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                  {JSON.stringify(evt.details)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
