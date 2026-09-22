import React, { useState } from 'react';
import axios from 'axios';
import { Users, ClipboardCheck } from 'lucide-react';

export const AttendanceTracker = ({ booking, onUpdated }) => {
  const service = booking.serviceId || {};
  const isTeam = service.workforceType === 'Workgroup Team' || Number(service.workerCount) > 1;
  if (!isTeam) return null;

  const crew = service.workerCount || 1;
  const logs = booking.attendanceLogs || [];
  const [workersPresent, setWorkersPresent] = useState(crew);
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(`/api/bookings/${booking._id}/attendance`, {
        date: new Date().toISOString().split('T')[0],
        workersPresent,
        tasksCompleted: tasksCompleted.split(',').map((t) => t.trim()).filter(Boolean),
        notes: ''
      });
      if (res.data.success) {
        setTasksCompleted('');
        if (onUpdated) onUpdated(res.data.booking);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-3">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
        <Users className="w-3.5 h-3.5" /> Daily Team Attendance ({crew} crew)
      </p>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
        <label className="text-xs font-bold text-slate-700">
          Workers present
          <input
            type="number"
            min="0"
            max={crew}
            value={workersPresent}
            onChange={(e) => setWorkersPresent(Number(e.target.value))}
            className="mt-1 w-full min-h-12 px-3 rounded-xl border border-emerald-200 bg-white text-sm font-bold"
          />
        </label>
        <label className="text-xs font-bold text-slate-700 sm:col-span-1">
          Tasks completed today
          <input
            type="text"
            value={tasksCompleted}
            onChange={(e) => setTasksCompleted(e.target.value)}
            placeholder="e.g. Paddy Transplanting"
            className="mt-1 w-full min-h-12 px-3 rounded-xl border border-emerald-200 bg-white text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="touch-action bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <ClipboardCheck className="w-4 h-4" />
          {saving ? 'Saving...' : 'Check in crew'}
        </button>
      </form>
      {logs.length > 0 && (
        <ul className="text-[11px] text-slate-700 space-y-1">
          {logs.slice().reverse().slice(0, 5).map((log, i) => (
            <li key={log._id || i} className="flex justify-between bg-white/70 px-2 py-1 rounded-lg">
              <span>{new Date(log.date || log.createdAt).toLocaleDateString()} — {log.workersPresent}/{crew} present</span>
              <span className="font-semibold">{(log.tasksCompleted || []).join(', ') || '—'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
