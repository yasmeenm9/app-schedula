'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  fee: number;
  slots: string[];
}

export default function PatientDocsPage() {
  const [patientName, setPatientName] = useState('John Doe');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [filterTab, setFilterTab] = useState('Upcoming');

  const defaultDoctors: Doctor[] = [
    { id: 'doc-default-2', name: 'Dr. Sarah Jenkins', specialty: 'Dermatology', fee: 400, slots: ['09:30 AM', '01:00 PM', '04:30 PM'] },
    { id: 'doc-default-3', name: 'Dr. Robert Chen', specialty: 'Pediatrics', fee: 600, slots: ['11:00 AM', '03:00 PM', '05:00 PM'] },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('patientAccount');
    let currentPatient = 'John Doe';
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.fullName) {
          setPatientName(data.fullName);
          currentPatient = data.fullName;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const storedAppointments: Appointment[] = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    setMyAppointments(storedAppointments.filter(app => app.patientName?.trim().toLowerCase() === currentPatient.trim().toLowerCase()));

    // Load all registered doctors safely with unique IDs
    let loadedDynamicDoctors: Doctor[] = [];
    const savedDoctorsArray = localStorage.getItem('registeredDoctors');
    if (savedDoctorsArray) {
      try {
        const parsedArray = JSON.parse(savedDoctorsArray);
        if (Array.isArray(parsedArray)) {
          loadedDynamicDoctors = parsedArray.map((doc: any, idx: number) => ({
            id: doc.id || `doc-reg-${idx}-${doc.email || idx}`,
            name: doc.fullName || doc.name,
            specialty: doc.specialty || 'General Medicine',
            fee: Number(doc.fee) || 500,
            slots: doc.slots || ['10:00 AM', '02:00 PM', '04:00 PM'],
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }

    const combined = [...defaultDoctors, ...loadedDynamicDoctors];
    const uniqueDoctors = Array.from(new Map(combined.map(d => [d.id, d])).values());
    setDoctorsList(uniqueDoctors);
  }, []);

  const handleBooking = () => {
    if (!selectedDoctor || !selectedSlot) return;

    const doc = doctorsList.find((d) => d.id === selectedDoctor);
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientName,
      doctorId: doc?.id,
      doctorName: doc?.name,
      specialty: doc?.specialty,
      date: '2026-06-10',
      time: selectedSlot,
      status: 'Pending',
    };

    const allAppointments = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const updatedAll = [newAppointment, ...allAppointments];
    localStorage.setItem('doctorAppointments', JSON.stringify(updatedAll));

    setMyAppointments(updatedAll.filter(app => app.patientName?.trim().toLowerCase() === patientName.trim().toLowerCase()));
    setSuccessMessage(`Appointment successfully booked with ${doc?.name} for ${selectedSlot}!`);
    setSelectedDoctor(null);
    setSelectedSlot(null);
  };

  const handleCancel = (id: string) => {
    const allAppointments = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const updatedAll = allAppointments.map((app: Appointment) => app.id === id ? { ...app, status: 'Cancelled' } : app);
    localStorage.setItem('doctorAppointments', JSON.stringify(updatedAll));
    setMyAppointments(updatedAll.filter((app: Appointment) => app.patientName?.trim().toLowerCase() === patientName.trim().toLowerCase()));
  };

  const filteredAppointments = myAppointments.filter(app => {
    if (filterTab === 'Upcoming') return app.status === 'Pending' || app.status === 'Confirmed';
    if (filterTab === 'Completed') return app.status === 'Completed';
    if (filterTab === 'Cancelled') return app.status === 'Cancelled';
    if (filterTab === 'Missed') return app.status === 'Missed';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-teal-400">Patient Booking Portal</h1>
            <p className="text-sm text-slate-400">Welcome, {patientName}. Choose a verified doctor and reserve your consultation slot.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/patient/profile" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              Profile
            </Link>
            <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">
              Sign Out
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm rounded-xl font-bold shadow-lg">
            {successMessage}
          </div>
        )}

        {/* Doctor Grid Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctorsList.map((doc) => (
            <div key={doc.id} className={`bg-slate-800/90 border p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all ${selectedDoctor === doc.id ? 'border-teal-400 ring-2 ring-teal-500/40' : 'border-slate-700'}`}>
              <div>
                <div className="text-teal-400 text-2xl mb-2">👨‍⚕️</div>
                <h3 className="text-lg font-bold text-white">{doc.name}</h3>
                <p className="text-xs text-teal-300 font-semibold mb-2">{doc.specialty}</p>
                <p className="text-xs text-slate-400 mb-4">Consultation Fee: <span className="text-white font-bold">₹{doc.fee}</span></p>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Available Slots:</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {doc.slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => { setSelectedDoctor(doc.id); setSelectedSlot(slot); setSuccessMessage(''); }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedDoctor === doc.id && selectedSlot === slot ? 'bg-teal-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-teal-500'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={selectedDoctor !== doc.id || !selectedSlot}
                onClick={handleBooking}
                className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all ${selectedDoctor === doc.id && selectedSlot ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'}`}
              >
                Confirm Booking
              </button>
            </div>
          ))}
        </div>

        {/* My Appointments with Tabs */}
        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-teal-400">My Appointments</h2>
            <div className="flex flex-wrap gap-2">
              {['Upcoming', 'Completed', 'Cancelled', 'Missed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${filterTab === tab ? 'bg-teal-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-teal-500'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <p className="text-sm text-slate-400">No {filterTab.toLowerCase()} appointments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Specialty</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-900/40 transition-all">
                      <td className="py-3.5 px-4 font-bold text-white">{app.doctorName || 'Dr. Alex Smith'}</td>
                      <td className="py-3.5 px-4 text-teal-300">{app.specialty || 'General'}</td>
                      <td className="py-3.5 px-4 text-slate-300">{app.date} at {app.time}</td>
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
                      <td className="py-3.5 px-4 text-right">
                        {(app.status === 'Pending' || app.status === 'Confirmed') && (
                          <button
                            onClick={() => handleCancel(app.id)}
                            className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        )}
                        {app.status === 'Completed' && (
                          <span className="text-xs text-teal-400 font-semibold">Prescription Available</span>
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