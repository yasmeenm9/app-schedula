'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Appointment {
  id: string;
  patientName: string;
  doctorName?: string;
  specialty?: string;
  date: string;
  time: string;
  status: string;
}

export default function DoctorAllAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Confirmed'>('all');

  useEffect(() => {
    const booked = localStorage.getItem('doctorAppointments');
    if (booked) {
      setAppointments(JSON.parse(booked));
    }
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = appointments.map((app) => (app.id === id ? { ...app, status: newStatus } : app));
    setAppointments(updated);
    localStorage.setItem('doctorAppointments', JSON.stringify(updated));
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter((app) => app.status === filter);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-teal-400">All Patient Appointments</h1>
            <p className="text-sm text-slate-400">Review, filter, and manage every consultation booking.</p>
          </div>
          <Link href="/doctor/dashboard" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2">
          {(['all', 'Pending', 'Confirmed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize ${filter === f ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
            >
              {f} Appointments
            </button>
          ))}
        </div>

        {/* Appointments Table */}
        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
          {filteredAppointments.length === 0 ? (
            <p className="text-sm text-slate-400">No appointments found matching this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-900/40 transition-all">
                      <td className="py-3.5 px-4 font-bold text-white">{app.patientName}</td>
                      <td className="py-3.5 px-4 text-slate-300">{app.date}</td>
                      <td className="py-3.5 px-4 text-slate-300">{app.time}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${app.status === 'Confirmed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {app.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusChange(app.id, 'Confirmed')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(app.id, 'Cancelled')}
                          className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}