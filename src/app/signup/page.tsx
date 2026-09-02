'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill out all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords must match.');
      return;
    }

    localStorage.setItem('patientAccount', JSON.stringify(formData));
    router.push('/login/patient');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-cover bg-center z-0" style={{ backgroundImage: `url('/land_p.webp')` }} />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="text-3xl font-black tracking-wider text-teal-400 hover:opacity-80 transition-all">SCHEDULA</Link>
        <p className="mt-1 text-sm text-slate-300">Patient Portal Registration</p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700">
          
          {error && <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Full Name</label>
              <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Email Address</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="patient@schedula.com" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Phone Number</label>
              <input name="phone" type="text" value={formData.phone} onChange={handleChange} placeholder="9876543210" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Password</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Confirm Password</label>
              <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none" />
            </div>

            <button type="submit" className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all mt-2">
              Create Patient Account
            </button>
          </form>

          <div className="mt-6 flex justify-between items-center text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-all">&larr; Back to Home</Link>
            <Link href="/login/patient" className="text-teal-400 font-bold hover:underline">Log in</Link>
          </div>

        </div>
      </div>
    </div>
  );
}