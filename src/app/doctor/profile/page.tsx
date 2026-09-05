'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Review {
  doctorName: string;
  patientName: string;
  rating: string;
  comment: string;
  date: string;
}

export default function DoctorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    id: '',
    fullName: 'Dr. Alex Smith',
    email: 'doctor@schedula.com',
    phone: '9876543210',
    specialty: 'Cardiology',
    experience: '5',
    fee: '500',
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('doctorAccount');
    let currentDocName = 'Dr. Alex Smith';
    if (saved) {
      try {
        const data = JSON.parse(saved);
        currentDocName = data.fullName || data.name || 'Dr. Alex Smith';
        setProfile((prev) => ({ ...prev, ...data }));
      } catch (e) {
        console.error(e);
      }
    }

    // Load reviews specifically for this doctor
    const allReviews: Review[] = JSON.parse(localStorage.getItem('doctorReviews') || '[]');
    const docReviews = allReviews.filter(r => r.doctorName?.trim().toLowerCase() === currentDocName.trim().toLowerCase());
    setReviews(docReviews);
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const docId = profile.id || `doc-${Date.now()}`;
    const updatedData = { ...profile, id: docId, name: profile.fullName };
    
    localStorage.setItem('doctorAccount', JSON.stringify(updatedData));

    const existingDocs = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
    const filteredDocs = existingDocs.filter((d: any) => d.email !== profile.email && d.id !== docId);
    localStorage.setItem('registeredDoctors', JSON.stringify([updatedData, ...filteredDocs]));

    setSavedMessage('Profile information successfully updated!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentDoctorSession');
    router.push('/login/doctor');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-teal-400">Doctor Profile & Portfolio</h1>
            <p className="text-sm text-slate-400">Manage your credentials and view patient feedback.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/doctor/dashboard" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              Dashboard
            </Link>
            <Link href="/doctor/appointments" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              Appointments
            </Link>
            <button onClick={handleSignOut} className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold transition-all border border-red-800 cursor-pointer">
              Sign Out
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm rounded-xl font-bold shadow-lg">
            {savedMessage}
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-6 bg-slate-800/90 border border-slate-700 p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-3">Professional Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Full Name</label>
              <input name="fullName" type="text" value={profile.fullName} onChange={handleProfileChange} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Email Address</label>
              <input name="email" type="email" value={profile.email} onChange={handleProfileChange} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Phone Number</label>
              <input name="phone" type="text" value={profile.phone} onChange={handleProfileChange} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Specialty</label>
              <select name="specialty" value={profile.specialty} onChange={handleProfileChange} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none">
                <option>Cardiology</option>
                <option>Dermatology</option>
                <option>General Medicine</option>
                <option>Pediatrics</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Experience (Years)</label>
              <input name="experience" type="number" value={profile.experience} onChange={handleProfileChange} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Consultation Fee (₹)</label>
              <input name="fee" type="number" value={profile.fee} onChange={handleProfileChange} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all mt-4 cursor-pointer">
            Save All Changes
          </button>
        </form>

        {/* Patient Reviews Section */}
        <div className="bg-slate-800/90 border border-slate-700 p-8 rounded-2xl shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-teal-400 border-b border-slate-700 pb-3">⭐ Patient Reviews & Testimonials</h2>

          {reviews.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No patient reviews received yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev, idx) => (
                <div key={idx} className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{rev.patientName}</span>
                    <span className="text-xs text-teal-400 font-semibold">{rev.rating}</span>
                  </div>
                  <p className="text-xs text-slate-300">{rev.comment}</p>
                  <span className="text-[10px] text-slate-500 block">{rev.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}