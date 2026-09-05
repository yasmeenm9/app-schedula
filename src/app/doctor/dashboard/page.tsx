'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DoctorDashboardPage() {
  const [doctorName, setDoctorName] = useState('Dr. Alex Smith');
  const [appointments, setAppointments] = useState([
    { id: '1', patientName: 'John Doe', date: '2026-06-10', time: '10:00 AM', status: 'Confirmed' },
    { id: '2', patientName: 'Sarah Connor', date: '2026-06-10', time: '11:30 AM', status: 'Pending' },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('doctorAccount');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.fullName) setDoctorName(data.fullName);
    }

    // Load any booked appointments from localStorage if available
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

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-teal-400">Doctor Dashboard</h1>
            <p className="text-sm text-slate-400">Welcome back, {doctorName}. Here is your clinic overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/doctor/profile" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl text-xs font-bold shadow-lg transition-all">
              Manage Profile & Slots
            </Link>
            <Link href="/doctor/appointments" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">
              All Appointments
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shadow-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
            <p className="text-3xl font-black text-teal-400 mt-2">{appointments.length}</p>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shadow-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Requests</p>
            <p className="text-3xl font-black text-amber-400 mt-2">
              {appointments.filter((a) => a.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shadow-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed Sessions</p>
            <p className="text-3xl font-black text-emerald-400 mt-2">
              {appointments.filter((a) => a.status === 'Confirmed').length}
            </p>
          </div>
        </div>

        {/* Upcoming Appointments Table Section */}
        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold">Upcoming Patient Appointments</h2>

          {appointments.length === 0 ? (
            <p className="text-sm text-slate-400">No active appointment bookings yet.</p>
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
                  {appointments.map((app) => (
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