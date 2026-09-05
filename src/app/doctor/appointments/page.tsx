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

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorName, setDoctorName] = useState('Dr. Alex Smith');
  const [filterTab, setFilterTab] = useState('All');
  const [successMsg, setSuccessMsg] = useState('');

  // Prescription Modal State
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [selectedAppForRx, setSelectedAppForRx] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');

  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppForReschedule, setSelectedAppForReschedule] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');

  useEffect(() => {
    localStorage.setItem('currentDoctorSession', 'true');
    const savedDoc = localStorage.getItem('doctorAccount');
    let resolvedName = 'Dr. Alex Smith';
    if (savedDoc) {
      try {
        const data = JSON.parse(savedDoc);
        resolvedName = data.fullName || data.name || 'Dr. Alex Smith';
        setDoctorName(resolvedName);
      } catch (e) {
        console.error(e);
      }
    }

    loadAppointments(resolvedName);
  }, []);

  const loadAppointments = (docName: string) => {
    const storedAppointments: Appointment[] = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const filtered = storedAppointments.filter(app => !app.doctorName || app.doctorName.trim().toLowerCase() === docName.trim().toLowerCase());
    setAppointments(filtered);
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentDoctorSession');
    router.push('/login/doctor');
  };

  const updateStatus = (id: string, newStatus: string) => {
    const allAppointments: Appointment[] = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const updatedAll = allAppointments.map((app) => (app.id === id ? { ...app, status: newStatus } : app));
    localStorage.setItem('doctorAppointments', JSON.stringify(updatedAll));

    loadAppointments(doctorName);

    // Notify patient
    const targetApp = updatedAll.find(a => a.id === id);
    if (targetApp) {
      const patientKey = `patientNotifications_${targetApp.patientName.trim().toLowerCase()}`;
      const patientNotifs = JSON.parse(localStorage.getItem(patientKey) || '[]');
      localStorage.setItem(patientKey, JSON.stringify([
        { id: Date.now(), text: `Your appointment status was updated to: ${newStatus} by ${doctorName}`, date: new Date().toLocaleDateString(), read: false },
        ...patientNotifs
      ]));
    }
    setSuccessMsg(`Appointment status changed to ${newStatus}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openRxModal = (app: Appointment) => {
    setSelectedAppForRx(app);
    setDiagnosis('');
    setMedicines('');
    setInstructions('');
    setIsRxModalOpen(true);
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForRx || !diagnosis || !medicines) return;

    const newPrescription = {
      appointmentId: selectedAppForRx.id,
      doctorName,
      patientName: selectedAppForRx.patientName,
      specialty: 'General Medicine',
      diagnosis,
      medicines,
      instructions,
      date: new Date().toLocaleDateString(),
    };

    const existingRx = JSON.parse(localStorage.getItem('doctorPrescriptions') || '[]');
    const filteredRx = existingRx.filter((rx: any) => rx.appointmentId !== selectedAppForRx.id);
    localStorage.setItem('doctorPrescriptions', JSON.stringify([newPrescription, ...filteredRx]));

    const patientKey = `patientNotifications_${selectedAppForRx.patientName.trim().toLowerCase()}`;
    const patientNotifs = JSON.parse(localStorage.getItem(patientKey) || '[]');
    localStorage.setItem(patientKey, JSON.stringify([
      { id: Date.now(), text: `New prescription issued by ${doctorName} for your completed appointment.`, date: new Date().toLocaleDateString(), read: false },
      ...patientNotifs
    ]));

    setIsRxModalOpen(false);
    setSuccessMsg(`Prescription successfully issued for ${selectedAppForRx.patientName}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openRescheduleModal = (app: Appointment) => {
    setSelectedAppForReschedule(app);
    setNewDate(app.date || '2026-06-10');
    setNewTime(app.time || '10:00 AM');
    setIsRescheduleModalOpen(true);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForReschedule || !newDate || !newTime) return;

    const allAppointments: Appointment[] = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const updatedAll = allAppointments.map((app) => 
      app.id === selectedAppForReschedule.id ? { ...app, date: newDate, time: newTime, status: 'Rescheduled' } : app
    );
    localStorage.setItem('doctorAppointments', JSON.stringify(updatedAll));

    loadAppointments(doctorName);

    const patientKey = `patientNotifications_${selectedAppForReschedule.patientName.trim().toLowerCase()}`;
    const patientNotifs = JSON.parse(localStorage.getItem(patientKey) || '[]');
    localStorage.setItem(patientKey, JSON.stringify([
      { id: Date.now(), text: `Your appointment with ${doctorName} was rescheduled to ${newDate} at ${newTime}.`, date: new Date().toLocaleDateString(), read: false },
      ...patientNotifs
    ]));

    setIsRescheduleModalOpen(false);
    setSuccessMsg(`Appointment rescheduled successfully to ${newDate} at ${newTime}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const filteredAppointments = appointments.filter(app => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Pending') return app.status === 'Pending';
    if (filterTab === 'Confirmed') return app.status === 'Confirmed';
    if (filterTab === 'Upcoming') return app.status === 'Pending' || app.status === 'Confirmed' || app.status === 'Rescheduled';
    if (filterTab === 'Completed') return app.status === 'Completed';
    if (filterTab === 'Cancelled') return app.status === 'Cancelled' || app.status === 'Rescheduled';
    if (filterTab === 'Missed') return app.status === 'Missed';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-teal-400">All Appointments</h1>
            <p className="text-sm text-slate-400">Manage all patient appointment logs, {doctorName}.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/doctor/dashboard" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              Dashboard
            </Link>
            <Link href="/doctor/profile" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              Profile
            </Link>
            <button onClick={handleSignOut} className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold transition-all border border-red-800 cursor-pointer">
              Sign Out
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm rounded-xl font-bold shadow-lg">
            {successMsg}
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Confirmed', 'Upcoming', 'Completed', 'Cancelled', 'Missed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === tab ? 'bg-teal-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-teal-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-teal-400">Appointment Logs ({filterTab})</h2>

          {filteredAppointments.length === 0 ? (
            <p className="text-sm text-slate-400">No appointments found matching this status filter.</p>
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
                            <button onClick={() => updateStatus(app.id, 'Confirmed')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer">Confirm</button>
                            <button onClick={() => updateStatus(app.id, 'Cancelled')} className="px-3 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold rounded-lg cursor-pointer">Decline</button>
                            <button onClick={() => openRescheduleModal(app)} className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer">Reschedule</button>
                          </>
                        )}
                        {app.status === 'Confirmed' && (
                          <>
                            <button onClick={() => updateStatus(app.id, 'Completed')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer">Complete</button>
                            <button onClick={() => updateStatus(app.id, 'Missed')} className="px-3 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-bold rounded-lg cursor-pointer">Missed</button>
                            <button onClick={() => openRescheduleModal(app)} className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer">Reschedule</button>
                          </>
                        )}
                        {app.status === 'Completed' && (
                          <button onClick={() => openRxModal(app)} className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer">
                            Write Rx
                          </button>
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

      {/* Prescription Writer Modal */}
      {isRxModalOpen && selectedAppForRx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-lg p-6 rounded-2xl shadow-2xl space-y-6 relative">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-teal-400">Issue Digital Prescription</h2>
                <p className="text-xs text-slate-400">Patient: {selectedAppForRx.patientName}</p>
              </div>
              <button onClick={() => setIsRxModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSavePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Diagnosis / Notes</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Viral Pharyngitis"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Medicines & Dosage</label>
                <textarea
                  value={medicines}
                  onChange={(e) => setMedicines(e.target.value)}
                  placeholder="1. Paracetamol 650mg - 1 tablet thrice a day&#10;2. Cetirizine 10mg - 1 at bedtime"
                  rows={4}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Special Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Drink warm water, rest for 3 days."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsRxModalOpen(false)} className="w-1/2 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="w-1/2 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer">Save & Send Rx</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedAppForReschedule && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 relative">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-teal-400">Reschedule Appointment</h2>
                <p className="text-xs text-slate-400">Patient: {selectedAppForReschedule.patientName}</p>
              </div>
              <button onClick={() => setIsRescheduleModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">New Time Slot</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 11:30 AM"
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsRescheduleModalOpen(false)} className="w-1/2 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="w-1/2 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer">Confirm Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}