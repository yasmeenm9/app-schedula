'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DoctorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    fullName: 'Dr. Alex Smith',
    email: 'doctor@schedula.com',
    phone: '9876543210',
    specialty: 'Cardiology',
    experience: '5',
    fee: '500',
  });

  const [slots, setSlots] = useState<string[]>(['10:00 AM', '11:30 AM', '02:00 PM']);
  const [newSlot, setNewSlot] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('currentDoctorSession', 'true');
    const saved = localStorage.getItem('doctorAccount');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProfile((prev) => ({ ...prev, ...data }));
        if (data.slots) setSlots(data.slots);
      } catch (e) {
        console.error('Failed to parse doctor account', e);
      }
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = { ...profile, slots, name: profile.fullName };
    
    localStorage.setItem('doctorAccount', JSON.stringify(updatedData));

    const existingDocs = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
    const filteredDocs = existingDocs.filter((d: any) => d.email !== profile.email);
    const updatedDocsList = [{ id: 'doc-registered', ...updatedData }, ...filteredDocs];
    localStorage.setItem('registeredDoctors', JSON.stringify(updatedDocsList));

    setSavedMessage('Profile and availability slots successfully updated!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleAddSlot = () => {
    if (!newSlot || slots.includes(newSlot)) return;
    const updatedSlots = [...slots, newSlot];
    setSlots(updatedSlots);
    setNewSlot('');
    
    const updatedData = { ...profile, slots: updatedSlots, name: profile.fullName };
    localStorage.setItem('doctorAccount', JSON.stringify(updatedData));

    const existingDocs = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
    const filteredDocs = existingDocs.filter((d: any) => d.email !== profile.email);
    localStorage.setItem('registeredDoctors', JSON.stringify([{ id: 'doc-registered', ...updatedData }, ...filteredDocs]));
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    const updatedSlots = slots.filter((s) => s !== slotToRemove);
    setSlots(updatedSlots);

    const updatedData = { ...profile, slots: updatedSlots, name: profile.fullName };
    localStorage.setItem('doctorAccount', JSON.stringify(updatedData));

    const existingDocs = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
    const filteredDocs = existingDocs.filter((d: any) => d.email !== profile.email);
    localStorage.setItem('registeredDoctors', JSON.stringify([{ id: 'doc-registered', ...updatedData }, ...filteredDocs]));
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentDoctorSession');
    router.push('/login/doctor');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-teal-400">Doctor Profile & Slot Manager</h1>
            <p className="text-sm text-slate-400">Manage your professional credentials and active consultation availability.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/doctor/dashboard" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              Dashboard
            </Link>
            <Link href="/doctor/appointments" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-700">
              Appointments
            </Link>
            <button onClick={handleSignOut} className="px-4 py-2 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl text-xs font-bold transition-all border border-red-800">
              Sign Out
            </button>
          </div>
        </div>

        {savedMessage && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm rounded-xl font-bold shadow-lg">
            {savedMessage}
          </div>
        )}

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

          {/* Slot Manager Section */}
          <div className="pt-6 border-t border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-teal-400">Appointment Availability / Slots</h3>
            <p className="text-xs text-slate-400">Add recurring time slots that will instantly show up on the user portal for booking.</p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                placeholder="e.g. 03:30 PM"
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
              >
                Add Slot
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {slots.map((slot) => (
                <div key={slot} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-300">
                  <span>{slot}</span>
                  <button type="button" onClick={() => handleRemoveSlot(slot)} className="text-red-400 hover:text-red-300 ml-1">×</button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all mt-4">
            Save All Changes
          </button>
        </form>

      </div>
    </div>
  );
}