'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DoctorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Check against registered doctors database
    const registered = JSON.parse(localStorage.getItem('registeredDoctors') || '[]');
    const foundDoc = registered.find((d: any) => d.email?.trim().toLowerCase() === email.trim().toLowerCase());

    if (!foundDoc) {
      setError('No registered doctor account found with this email. Please register first.');
      return;
    }

    // Set current active session and account uniquely
    localStorage.setItem('currentDoctorSession', 'true');
    localStorage.setItem('doctorAccount', JSON.stringify(foundDoc));
    router.push('/doctor/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-cover bg-center z-0" style={{ backgroundImage: `url('/land_p.webp')` }} />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="text-3xl font-black tracking-wider text-teal-400 hover:opacity-80 transition-all">SCHEDULA</Link>
        <p className="mt-1 text-sm text-slate-300">Doctor Portal Login</p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700">
          
          {error && <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@schedula.com"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-teal-500 text-sm focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all mt-2">
              Sign In as Doctor
            </button>
          </form>

          <div className="mt-6 flex justify-between items-center text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-all">&larr; Back to Home</Link>
            <Link href="/signup/doctor" className="text-teal-400 font-bold hover:underline">Register account</Link>
          </div>

        </div>
      </div>
    </div>
  );
}