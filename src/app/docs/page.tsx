'use client';

import { useState } from 'react';

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Anika Rao', specialty: 'General Medicine', exp: '8 years', slot: '10:00 AM - 10:30 AM' },
  { id: 2, name: 'Dr. Martin Cole', specialty: 'Skin Consultation', exp: '5 years', slot: '11:15 AM - 11:45 AM' },
  { id: 3, name: 'Dr. Priya Sharma', specialty: 'Cardiology', exp: '10 years', slot: '2:00 PM - 2:30 PM' },
];

export default function DoctorsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [booked, setBooked] = useState(false);

  const handleBook = (doctor: any) => {
    setSelectedDoctor(doctor);
    setBooked(false);
  };

  const confirmBooking = () => {
    setBooked(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Find & Book Doctors</h1>
        
        {booked ? (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-green-800">Booking Confirmed! 🎉</h2>
            <p className="text-green-600 mt-2">Your appointment with {selectedDoctor?.name} has been successfully scheduled.</p>
            <button 
              onClick={() => { setBooked(false); setSelectedDoctor(null); }}
              className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800"
            >
              Book Another Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Available Doctors</h2>
              {MOCK_DOCTORS.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{doc.name}</h3>
                    <p className="text-sm text-gray-600">{doc.specialty} • {doc.exp} exp</p>
                  </div>
                  <button
                    onClick={() => handleBook(doc)}
                    className="px-4 py-2 bg-teal-700 text-white text-sm rounded-md hover:bg-teal-800"
                  >
                    Select Slot
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-fit">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Summary</h2>
              {selectedDoctor ? (
                <div className="space-y-4">
                  <p className="text-gray-700"><span className="font-medium">Doctor:</span> {selectedDoctor.name}</p>
                  <p className="text-gray-700"><span className="font-medium">Specialty:</span> {selectedDoctor.specialty}</p>
                  <p className="text-gray-700"><span className="font-medium">Time Slot:</span> {selectedDoctor.slot}</p>
                  <button
                    onClick={confirmBooking}
                    className="w-full py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
                  >
                    Confirm Appointment
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 italic">Please select a doctor to view slots and confirm booking.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}