'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DoctorSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: 'Cardiology',
    experience: '',
    fee: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (step === 1 && (!formData.fullName || !formData.email || !formData.phone)) {
      setError('Please fill out all personal details.');
      return;
    }
    if (step === 2 && (!formData.specialty || !formData.experience || !formData.fee)) {
      setError('Please fill out all professional details.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password || formData.password !== formData.confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    localStorage.setItem('doctorAccount', JSON.stringify(formData));
    router.push('/login/doctor');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-cover bg-center z-0" style={{ backgroundImage: `url('/land_p.webp')` }} />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="text-3xl font-black tracking-wider text-teal-400 hover:opacity-80 transition-all">SCHEDULA</Link>
        <p className="mt-1 text-sm text-slate-300">Doctor Portal Registration</p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700">
          
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 pb-2 border-b border-slate-700">
            <span className={step === 1 ? 'text-teal-400' : ''}>1. Personal</span>
            <span className={step === 2 ? 'text-teal-400' : ''}>2. Professional</span>
            <span className={step === 3 ? 'text-teal-400' : ''}>3. Security</span>
          </div>

          {error && <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Full Name</label>
                  <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Dr. Alex Smith" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="doctor@schedula.com" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Phone</label>
                  <input name="phone" type="text" value={formData.phone} onChange={handleChange} placeholder="9876543210" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
                </div>
                <button type="button" onClick={handleNext} className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-all mt-2 shadow-lg">Next Step</button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Specialty</label>
                  <select name="specialty" value={formData.specialty} onChange={handleChange} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none">
                    <option>Cardiology</option>
                    <option>Dermatology</option>
                    <option>General Medicine</option>
                    <option>Pediatrics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Experience (Years)</label>
                  <input name="experience" type="number" value={formData.experience} onChange={handleChange} placeholder="5" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Consultation Fee (₹)</label>
                  <input name="fee" type="number" value={formData.fee} onChange={handleChange} placeholder="500" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="w-1/2 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-sm transition-all">Back</button>
                  <button type="button" onClick={handleNext} className="w-1/2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg">Next Step</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Password</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Confirm Password</label>
                  <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setStep(2)} className="w-1/2 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-sm transition-all">Back</button>
                  <button type="submit" className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg">Register</button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 flex justify-between items-center text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-all">&larr; Back to Home</Link>
            <Link href="/login/doctor" className="text-teal-400 font-bold hover:underline">Log in</Link>
          </div>

        </div>
      </div>
    </div>
  );
}