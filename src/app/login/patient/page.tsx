'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientLoginPage() {
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

    // Derive the patient's name from their email handle (e.g., mark.james -> Mark James)
    const username = email.split('@')[0];
    const formattedName = username
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // Save the correct active user profile to localStorage
    const patientSession = {
      email,
      fullName: formattedName || 'Patient User',
    };
    localStorage.setItem('patientAccount', JSON.stringify(patientSession));

    // Route patient to appointment portal
    router.push('/docs');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-cover bg-center z-0" style={{ backgroundImage: `url('/land_p.webp')` }} />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="text-3xl font-black tracking-wider text-teal-400 hover:opacity-80 transition-all">SCHEDULA</Link>
        <p className="mt-1 text-sm text-slate-300">Patient Portal Login</p>
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
                placeholder="patient@schedula.com"
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

            <button type="submit" className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all mt-2 cursor-pointer">
              Sign In as Patient
            </button>
          </form>

          <div className="mt-6 flex justify-between items-center text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-all">&larr; Back to Home</Link>
            <Link href="/signup" className="text-teal-400 font-bold hover:underline">Register account</Link>
          </div>

        </div>
      </div>
    </div>
  );
}