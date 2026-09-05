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
  recurrence?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  fee: number;
  slots: string[];
}

interface Prescription {
  appointmentId: string;
  doctorName: string;
  patientName: string;
  specialty: string;
  diagnosis: string;
  medicines: string;
  instructions: string;
  date: string;
}

interface Notification {
  id: number;
  text: string;
  date: string;
  read?: boolean;
}

export default function PatientDocsPage() {
  const [patientName, setPatientName] = useState('Patient');
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [filterTab, setFilterTab] = useState('Upcoming');
  const [prescriptionsMap, setPrescriptionsMap] = useState<Record<string, boolean>>({});
  
  // Notification State with per-user key
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modal State for Booking
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-06-10');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [recurrenceOption, setRecurrenceOption] = useState('One-time');
  const [successMessage, setSuccessMessage] = useState('');

  // Prescription View Modal State
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDocName, setReviewDocName] = useState('');

  const defaultDoctors: Doctor[] = [
    { id: 'doc-default-2', name: 'Dr. Sarah Jenkins', specialty: 'Dermatology', fee: 400, slots: ['09:30 AM', '01:00 PM', '04:30 PM'] },
    { id: 'doc-default-3', name: 'Dr. Robert Chen', specialty: 'Pediatrics', fee: 600, slots: ['11:00 AM', '03:00 PM', '05:00 PM'] },
  ];

  useEffect(() => {
    let currentPatient = 'Patient';
    const saved = localStorage.getItem('patientAccount');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const resolvedName = data.fullName || data.name || (data.email ? data.email.split('@')[0] : 'Patient');
        if (resolvedName) {
          currentPatient = resolvedName;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setPatientName(currentPatient);

    const storedAppointments: Appointment[] = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const userAppointments = storedAppointments.filter(app => app.patientName?.trim().toLowerCase() === currentPatient.trim().toLowerCase());
    setMyAppointments(userAppointments);

    const allPrescriptions: Prescription[] = JSON.parse(localStorage.getItem('doctorPrescriptions') || '[]');
    const rxStatusMap: Record<string, boolean> = {};
    userAppointments.forEach(app => {
      rxStatusMap[app.id] = allPrescriptions.some(rx => rx.appointmentId === app.id);
    });
    setPrescriptionsMap(rxStatusMap);

    // Load user-isolated notifications
    const patientKey = `patientNotifications_${currentPatient.trim().toLowerCase()}`;
    const storedNotifs: Notification[] = JSON.parse(localStorage.getItem(patientKey) || '[]');
    setNotifications(storedNotifs);

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

  const openBookingModal = (doc: Doctor) => {
    setActiveDoctor(doc);
    setSelectedSlot(doc.slots[0] || '10:00 AM');
    setRecurrenceOption('One-time');
    setIsModalOpen(true);
    setSuccessMessage('');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctor || !selectedSlot || !bookingDate) return;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientName,
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      specialty: activeDoctor.specialty,
      date: bookingDate,
      time: selectedSlot,
      status: 'Pending',
      recurrence: recurrenceOption,
    };

    const allAppointments = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const updatedAll = [newAppointment, ...allAppointments];
    localStorage.setItem('doctorAppointments', JSON.stringify(updatedAll));

    setMyAppointments(updatedAll.filter(app => app.patientName?.trim().toLowerCase() === patientName.trim().toLowerCase()));
    
    // Add user-isolated notification
    const patientKey = `patientNotifications_${patientName.trim().toLowerCase()}`;
    const newNotif = { id: Date.now(), text: `Booking request sent to ${activeDoctor.name}`, date: new Date().toLocaleDateString(), read: false };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem(patientKey, JSON.stringify(updatedNotifs));

    setSuccessMessage(`Appointment successfully booked with ${activeDoctor.name}!`);
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMessage('');
    }, 1500);
  };

  const toggleNotificationRead = (id: number) => {
    const patientKey = `patientNotifications_${patientName.trim().toLowerCase()}`;
    const updated = notifications.map(n => n.id === id ? { ...n, read: !n.read } : n);
    setNotifications(updated);
    localStorage.setItem(patientKey, JSON.stringify(updated));
  };

  const handleCancel = (id: string) => {
    const allAppointments = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const updatedAll = allAppointments.map((app: Appointment) => app.id === id ? { ...app, status: 'Cancelled' } : app);
    localStorage.setItem('doctorAppointments', JSON.stringify(updatedAll));
    setMyAppointments(updatedAll.filter((app: Appointment) => app.patientName?.trim().toLowerCase() === patientName.trim().toLowerCase()));
  };

  const openPrescriptionModal = (appointmentId: string) => {
    const allPrescriptions: Prescription[] = JSON.parse(localStorage.getItem('doctorPrescriptions') || '[]');
    const foundRx = allPrescriptions.find(rx => rx.appointmentId === appointmentId);
    if (foundRx) {
      setActivePrescription(foundRx);
      setIsRxModalOpen(true);
    } else {
      alert('Prescription is not available yet.');
    }
  };

  const handleOpenReview = (docName?: string) => {
    setReviewDocName(docName || 'Doctor');
    setReviewRating('5');
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const reviews = JSON.parse(localStorage.getItem('doctorReviews') || '[]');
    const newReview = { doctorName: reviewDocName, patientName, rating: reviewRating, comment: reviewComment, date: new Date().toLocaleDateString() };
    localStorage.setItem('doctorReviews', JSON.stringify([newReview, ...reviews]));
    setIsReviewModalOpen(false);
    setSuccessMessage(`Review submitted successfully for ${reviewDocName}!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredAppointments = myAppointments.filter(app => {
    if (filterTab === 'Upcoming') return app.status === 'Pending' || app.status === 'Confirmed';
    if (filterTab === 'Completed') return app.status === 'Completed';
    if (filterTab === 'Cancelled') return app.status === 'Cancelled';
    if (filterTab === 'Missed') return app.status === 'Missed';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10 relative">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-teal-400">Patient Booking Portal</h1>
            <p className="text-sm text-slate-400">Welcome, {patientName}. Choose a verified doctor and reserve your consultation slot.</p>
          </div>
          <div className="flex items-center gap-3 relative">
            
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">Notifications (Click to toggle read)</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No notifications found.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => toggleNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl text-xs space-y-1 cursor-pointer transition-all border ${
                          n.read
                            ? 'bg-slate-900/40 border-slate-700 opacity-60'
                            : 'bg-slate-900 border-teal-500/60 shadow'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-slate-200 font-medium">{n.text}</p>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-teal-400 flex-shrink-0 mt-1" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block">{n.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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

        {/* Clean Doctor Grid with Book Now Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctorsList.map((doc) => (
            <div key={doc.id} className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all hover:border-teal-500/50">
              <div>
                <div className="text-teal-400 text-2xl mb-2">👨‍⚕️</div>
                <h3 className="text-lg font-bold text-white">{doc.name}</h3>
                <p className="text-xs text-teal-300 font-semibold mb-2">{doc.specialty}</p>
                <p className="text-xs text-slate-400 mb-6">Consultation Fee: <span className="text-white font-bold">₹{doc.fee}</span></p>
              </div>

              <button
                onClick={() => openBookingModal(doc)}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Book Now
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === tab ? 'bg-teal-500 text-slate-950 shadow-md' : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-teal-500'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <p className="text-sm text-slate-400">No {filterTab.toLowerCase()} appointments found for {patientName}.</p>
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
                  {filteredAppointments.map((app) => {
                    const hasRx = prescriptionsMap[app.id];
                    const matchedDoc = doctorsList.find(d => d.name === app.doctorName) || defaultDoctors[0];

                    return (
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
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {(app.status === 'Pending' || app.status === 'Confirmed') && (
                            <button
                              onClick={() => handleCancel(app.id)}
                              className="px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          {app.status === 'Completed' && (
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {/* Prescription Availability Badge & View */}
                              {hasRx ? (
                                <button
                                  onClick={() => openPrescriptionModal(app.id)}
                                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                                >
                                  View Prescription
                                </button>
                              ) : (
                                <span className="text-[11px] text-amber-400 font-semibold italic">Prescription Not Available</span>
                              )}

                              {/* Review Doctor */}
                              <button
                                onClick={() => handleOpenReview(app.doctorName)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Review Doctor
                              </button>

                              {/* Rebook Appointment */}
                              <button
                                onClick={() => openBookingModal(matchedDoc)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Rebook
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Booking Dialog Modal */}
      {isModalOpen && activeDoctor && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 relative">
            
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-teal-400">Book Consultation</h2>
                <p className="text-xs text-slate-400">{activeDoctor.name} ({activeDoctor.specialty})</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </div>

            {successMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-xl font-bold">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Select Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Available Time Slots</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                >
                  {activeDoctor.slots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Booking Recurrence</label>
                <select
                  value={recurrenceOption}
                  onChange={(e) => setRecurrenceOption(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                >
                  <option value="One-time">One-time Consultation</option>
                  <option value="Weekly (4 weeks)">Weekly (Repeat for 4 weeks)</option>
                  <option value="Monthly (3 months)">Monthly (Repeat for 3 months)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Prescription View Modal */}
      {isRxModalOpen && activePrescription && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-teal-500/50 w-full max-w-lg p-8 rounded-2xl shadow-2xl space-y-6 relative text-white">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-teal-400">MEDICAL PRESCRIPTION</h2>
                <p className="text-xs text-slate-400">Schedula Digital Healthcare System</p>
              </div>
              <button onClick={() => setIsRxModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div>
                <span className="text-slate-400 block uppercase font-bold">Doctor:</span>
                <span className="font-bold text-white text-sm">{activePrescription.doctorName}</span>
                <span className="text-teal-300 block">{activePrescription.specialty}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-bold">Patient:</span>
                <span className="font-bold text-white text-sm">{activePrescription.patientName}</span>
                <span className="text-slate-300 block">Date: {activePrescription.date}</span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Diagnosis</label>
                <p className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200">{activePrescription.diagnosis}</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Prescribed Medicines & Dosage</label>
                <p className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 whitespace-pre-line font-mono text-xs">{activePrescription.medicines}</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">Special Instructions</label>
                <p className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-xs">{activePrescription.instructions}</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Print / Download PDF
              </button>
              <button
                onClick={() => setIsRxModalOpen(false)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Review Doctor Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 relative">
            
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <div>
                <h2 className="text-xl font-bold text-teal-400">Review Doctor</h2>
                <p className="text-xs text-slate-400">{reviewDocName}</p>
              </div>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Rating (Stars)</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option value="3">⭐⭐⭐ (3/5)</option>
                  <option value="2">⭐⭐ (2/5)</option>
                  <option value="⭐ (1/5)">⭐ (1/5)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Your Feedback</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your consultation experience..."
                  rows={3}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-1/2 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}