'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  patientName: string;
  doctorName?: string;
  date: string;
  time: string;
  status: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorName, setDoctorName] = useState('Dr. Alex Smith');

  useEffect(() => {
    localStorage.setItem('currentDoctorSession', 'true');
    const savedDoc = localStorage.getItem('doctorAccount');
    if (savedDoc) {
      try {
        const data = JSON.parse(savedDoc);
        const resolvedName = data.fullName || data.name || (data.email ? data.email.split('@')[0] : null);
        if (resolvedName) {
          setDoctorName(resolvedName);
        }
      } catch (e) {
        console.error('Failed to parse doctor account', e);
      }
    }

    const storedAppointments = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    setAppointments(storedAppointments);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('currentDoctorSession');
    router.push('/login/doctor');
  };

  const updateStatus = (id: string, newStatus: string) => {
    const updated = appointments.map((app) => (app.id === id ? { ...app, status: newStatus } : app));
    setAppointments(updated);
    localStorage.setItem('doctorAppointments', JSON.stringify(updated));

    const notifications = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
    localStorage.setItem('patientNotifications', JSON.stringify([
      { id: Date.now(), text: `Your appointment status was updated to: ${newStatus}`, date: new Date().toLocaleDateString() },
      ...notifications
    ]));
  };

  const totalBookings = appointments.length;
  const pendingRequests = appointments.filter((a) => a.status === 'Pending').length;
  const confirmedSessions = appointments.filter((a) => a.status === 'Confirmed').length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-teal-400">Doctor Dashboard</h1>
            <p className="text-sm text-slate-400">Welcome back, {doctorName}. Here is your clinic overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/doctor/profile" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              Manage Profile & Slots
            </Link>
            <Link href="/doctor/appointments" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              All Appointments
            </Link>
            <button 
              onClick={handleSignOut} 
              className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold transition-all border border-red-800"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <p className="text-xs uppercase font-bold text-slate-400 mb-1">Total Bookings</p>
            <p className="text-3xl font-black text-teal-400">{totalBookings}</p>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <p className="text-xs uppercase font-bold text-slate-400 mb-1">Pending Requests</p>
            <p className="text-3xl font-black text-amber-400">{pendingRequests}</p>
          </div>
          <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <p className="text-xs uppercase font-bold text-slate-400 mb-1">Confirmed Sessions</p>
            <p className="text-3xl font-black text-emerald-400">{confirmedSessions}</p>
          </div>
        </div>

        {/* Upcoming Appointments Queue */}
        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-teal-400">Upcoming Patient Appointments</h2>

          {appointments.length === 0 ? (
            <p className="text-sm text-slate-400">No patient bookings registered yet.</p>
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
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                          app.status === 'Confirmed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          app.status === 'Completed' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          app.status === 'Cancelled' || app.status === 'Missed' ? 'bg-red-950 text-red-300 border border-red-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {app.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(app.id, 'Confirmed')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg">Confirm</button>
                            <button onClick={() => updateStatus(app.id, 'Cancelled')} className="px-3 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold rounded-lg">Decline</button>
                          </>
                        )}
                        {app.status === 'Confirmed' && (
                          <>
                            <button onClick={() => updateStatus(app.id, 'Completed')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg">Complete</button>
                            <button onClick={() => updateStatus(app.id, 'Missed')} className="px-3 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-bold rounded-lg">Missed</button>
                          </>
                        )}
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