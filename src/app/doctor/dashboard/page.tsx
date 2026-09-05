'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  specialty?: string;
  date: string;
  time: string;
  status: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorName, setDoctorName] = useState('Dr. Alex Smith');
  const [doctorId, setDoctorId] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('General Medicine');
  
  const [slots, setSlots] = useState<string[]>(['10:00 AM', '02:00 PM']);
  const [newSlot, setNewSlot] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Prescription Modal State for Doctor
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [selectedAppForRx, setSelectedAppForRx] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    localStorage.setItem('currentDoctorSession', 'true');
    const savedDoc = localStorage.getItem('doctorAccount');
    let resolvedName = 'Dr. Alex Smith';
    let resolvedId = '';
    let resolvedSpecialty = 'General Medicine';

    if (savedDoc) {
      try {
        const data = JSON.parse(savedDoc);
        resolvedName = data.fullName || data.name || 'Dr. Alex Smith';
        resolvedId = data.id || '';
        resolvedSpecialty = data.specialty || 'General Medicine';
        setDoctorName(resolvedName);
        setDoctorId(resolvedId);
        setDoctorSpecialty(resolvedSpecialty);
        if (data.slots && Array.isArray(data.slots)) {
          setSlots(data.slots);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const storedAppointments: Appointment[] = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const filtered = storedAppointments.filter(app => {
      const matchName = app.doctorName && app.doctorName.trim().toLowerCase() === resolvedName.trim().toLowerCase();
      const matchId = app.doctorId && resolvedId && app.doctorId === resolvedId;
      return matchName || matchId || !app.doctorName;
    });
    setAppointments(filtered);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('currentDoctorSession');
    router.push('/login/doctor');
  };

  const handleAddSlot = () => {
    if (!newSlot || slots.includes(newSlot)) return;
    const updatedSlots = [...slots, newSlot];
    setSlots(updatedSlots);
    setNewSlot('');

    const savedDoc = JSON.parse(localStorage.getItem('doctorAccount') || '{}');
    const updatedDoc = { ...savedDoc, slots: updatedSlots };
    localStorage.setItem('doctorAccount', JSON.stringify(updatedDoc));

    const existingDocs = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
    const filteredDocs = existingDocs.filter((d: any) => d.email !== updatedDoc.email);
    localStorage.setItem('registeredDoctors', JSON.stringify([updatedDoc, ...filteredDocs]));

    setSuccessMsg('Availability slot successfully added!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    const updatedSlots = slots.filter(s => s !== slotToRemove);
    setSlots(updatedSlots);

    const savedDoc = JSON.parse(localStorage.getItem('doctorAccount') || '{}');
    const updatedDoc = { ...savedDoc, slots: updatedSlots };
    localStorage.setItem('doctorAccount', JSON.stringify(updatedDoc));

    const existingDocs = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
    const filteredDocs = existingDocs.filter((d: any) => d.email !== updatedDoc.email);
    localStorage.setItem('registeredDoctors', JSON.stringify([updatedDoc, ...filteredDocs]));
  };

  const updateStatus = (id: string, newStatus: string) => {
    const allAppointments: Appointment[] = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const updatedAll = allAppointments.map((app) => (app.id === id ? { ...app, status: newStatus } : app));
    localStorage.setItem('doctorAppointments', JSON.stringify(updatedAll));

    const refreshed = updatedAll.filter(app => 
      !app.doctorName || app.doctorName.trim().toLowerCase() === doctorName.trim().toLowerCase()
    );
    setAppointments(refreshed);

    const targetApp = updatedAll.find(a => a.id === id);
    if (targetApp) {
      const patientKey = `patientNotifications_${targetApp.patientName.trim().toLowerCase()}`;
      const patientNotifs = JSON.parse(localStorage.getItem(patientKey) || '[]');
      localStorage.setItem(patientKey, JSON.stringify([
        { id: Date.now(), text: `Your appointment status was updated to: ${newStatus} by ${doctorName}`, date: new Date().toLocaleDateString(), read: false },
        ...patientNotifs
      ]));
    }
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
      specialty: doctorSpecialty,
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

  const totalBookings = appointments.length;
  const pendingRequests = appointments.filter((a) => a.status === 'Pending').length;
  const confirmedSessions = appointments.filter((a) => a.status === 'Confirmed').length;
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending');

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-teal-400">Doctor Dashboard</h1>
            <p className="text-sm text-slate-400">Welcome back, {doctorName}. Manage your availability slots and patient bookings.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/doctor/profile" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              Edit Profile
            </Link>
            <Link href="/doctor/appointments" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow">
              All Appointments
            </Link>
            <button 
              onClick={handleSignOut} 
              className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold transition-all border border-red-800 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm rounded-xl font-bold shadow-lg">
            {successMsg}
          </div>
        )}

        {/* Stats Row */}
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

        {/* Simple Slot Manager */}
        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-teal-400">⚡ Manage Available Time Slots</h2>
          <p className="text-xs text-slate-400">Add or remove active time slots that display on the patient booking portal.</p>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="e.g. 03:30 PM"
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
            />
            <button onClick={handleAddSlot} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer">
              Add Slot
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {slots.map(slot => (
              <div key={slot} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-300">
                <span>{slot}</span>
                <button onClick={() => handleRemoveSlot(slot)} className="text-red-400 hover:text-red-300 ml-1">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Pending Requests Preview (Streamlined to avoid table redundancy) */}
        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-amber-400">⚠️ Quick Action: Pending Booking Requests</h2>
            <Link href="/doctor/appointments" className="text-xs text-teal-400 hover:underline font-semibold">View All Appointments &rarr;</Link>
          </div>

          {pendingAppointments.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No pending requests requiring immediate attention.</p>
          ) : (
            <div className="space-y-3">
              {pendingAppointments.map((app) => (
                <div key={app.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 border border-slate-700 rounded-xl gap-4">
                  <div>
                    <p className="font-bold text-white text-sm">{app.patientName}</p>
                    <p className="text-xs text-slate-400">{app.date} at {app.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateStatus(app.id, 'Confirmed')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer">Confirm</button>
                    <button onClick={() => updateStatus(app.id, 'Cancelled')} className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold rounded-lg cursor-pointer">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Doctor Prescription Writer Modal */}
      {isRxModalOpen && selectedAppForRx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-lg p-6 rounded-2xl shadow-2xl space-y-6 relative">
            
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-teal-400">Issue Digital Prescription</h2>
                <p className="text-xs text-slate-400">Patient: {selectedAppForRx.patientName}</p>
              </div>
              <button onClick={() => setIsRxModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
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
                <button
                  type="button"
                  onClick={() => setIsRxModalOpen(false)}
                  className="w-1/2 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Save & Send Rx
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}