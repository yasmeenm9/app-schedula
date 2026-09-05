'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-cover bg-center z-0" style={{ backgroundImage: `url('/land_p.webp')` }} />

      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-wider text-teal-400">SCHEDULA</span>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 text-center flex flex-col items-center justify-center flex-grow">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
          Streamlined Healthcare <span className="text-teal-400">Scheduling</span>
        </h1>
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed">
          Connect patients with elite practitioners effortlessly. Real-time availability and secure management portals.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
          
          {/* Patient Card */}
          <div className="bg-slate-800/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-2xl text-left flex flex-col justify-between">
            <div>
              <div className="text-teal-400 text-3xl mb-3">🩺</div>
              <h3 className="text-xl font-bold text-white mb-2">Patient Portal</h3>
              <p className="text-xs text-slate-400 mb-6">Browse verified doctors, check live open consultation slots, and book appointments.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/login/patient" className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl text-center transition-all">
                Patient Login
              </Link>
              <Link href="/signup" className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl text-center shadow-lg transition-all">
                Patient Signup
              </Link>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="bg-slate-800/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-2xl text-left flex flex-col justify-between">
            <div>
              <div className="text-teal-400 text-3xl mb-3">🏥</div>
              <h3 className="text-xl font-bold text-white mb-2">Doctor Portal</h3>
              <p className="text-xs text-slate-400 mb-6">Manage your practice profile, configure your schedules, and view patient bookings.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/login/doctor" className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl text-center transition-all">
                Doctor Login
              </Link>
              <Link href="/signup/doctor" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center shadow-lg transition-all">
                Doctor Signup
              </Link>
            </div>
          </div>

        </div>
      </main>

      
    </div>
  );
}