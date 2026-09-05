'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatientProfilePage() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    weight: '',
    height: '',
    allergies: '',
    conditions: '',
    medications: '',
    insuranceProvider: '',
    insurancePolicyNo: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    currentSymptoms: '',
    location: '',
  });

  const [stats, setStats] = useState({
    totalPrescriptions: 0,
    completedAppointments: 0,
    testReportsCount: 0,
  });

  const [testReports, setTestReports] = useState<any[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // 1. Fetch dynamic session/registration info
    const savedSession = localStorage.getItem('patientAccount');
    let userKey = '';
    let parsedName = '';
    
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        userKey = data.email || data.fullName || '';
        parsedName = data.fullName || data.name || '';
        setProfile(prev => ({
          ...prev,
          fullName: parsedName,
          email: data.email || '',
        }));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Fetch stored clinical data if available
    if (userKey) {
      const savedProfiles = JSON.parse(localStorage.getItem('patientProfilesDatabase') || '{}');
      if (savedProfiles[userKey]) {
        setProfile(prev => ({ ...prev, ...savedProfiles[userKey] }));
      }
    }

    // 3. Compute dynamic metrics & derive test reports from prescriptions/completed appointments
    const appointments = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const completed = appointments.filter((a: any) => 
      a.status === 'Completed' && (!parsedName || a.patientName?.trim().toLowerCase() === parsedName.trim().toLowerCase())
    ).length;
    
    const prescriptions = JSON.parse(localStorage.getItem('doctorPrescriptions') || '[]');
    const myRx = prescriptions.filter((rx: any) => 
      !parsedName || rx.patientName?.trim().toLowerCase() === parsedName.trim().toLowerCase()
    );

    // Sync reports dynamically based on issued prescriptions/consultations
    const derivedReports = myRx.map((rx: any, idx: number) => ({
      id: rx.appointmentId || `rep-${idx}`,
      title: `Clinical Summary & Rx Record #${idx + 1}`,
      date: rx.date || 'Recent',
      lab: rx.doctorName || 'Schedula Clinical Network',
      findings: `Diagnosis: ${rx.diagnosis}. Treatment verified and archived.`
    }));

    setTestReports(derivedReports);
    setStats({
      totalPrescriptions: myRx.length,
      completedAppointments: completed,
      testReportsCount: derivedReports.length,
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const userKey = profile.email || profile.fullName;
    if (!userKey) return;

    const savedProfiles = JSON.parse(localStorage.getItem('patientProfilesDatabase') || '{}');
    savedProfiles[userKey] = profile;
    localStorage.setItem('patientProfilesDatabase', JSON.stringify(savedProfiles));

    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-teal-400 tracking-tight">Patient Health Portfolio</h1>
            <p className="text-xs sm:text-sm text-slate-400">Manage your verified credentials and clinical profile data.</p>
          </div>
          <Link href="/docs" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-teal-300 rounded-xl text-xs font-bold transition-all border border-slate-800">
            &larr; Portal Dashboard
          </Link>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-sm rounded-xl font-bold shadow-lg">
            {successMsg}
          </div>
        )}

        {/* Summary Metric Cards (Auto-Collapsing Grid) */}
        <div className={`grid grid-cols-1 sm:grid-cols-${stats.testReportsCount > 0 ? '3' : '2'} gap-5`}>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Total Prescriptions</span>
            <span className="text-3xl font-black text-teal-400 mt-2">{stats.totalPrescriptions}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Completed Consultations</span>
            <span className="text-3xl font-black text-blue-400 mt-2">{stats.completedAppointments}</span>
          </div>
          {stats.testReportsCount > 0 && (
            <div 
              onClick={() => setIsReportModalOpen(true)}
              className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 transition-all"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Diagnostic Reports</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">View All</span>
              </div>
              <span className="text-3xl font-black text-emerald-400 mt-2">{stats.testReportsCount} Available</span>
            </div>
          )}
        </div>

        {/* Structured Editable Profile Form */}
        <form onSubmit={handleSave} className="space-y-8 bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
          
          {/* Section 1: Personal Registered Credentials */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-2">1. Registration Credentials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                <input name="fullName" type="text" value={profile.fullName} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                <input name="email" type="email" value={profile.email} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                <input name="phone" type="text" value={profile.phone} onChange={handleChange} placeholder="Not provided" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Location / City</label>
                <input name="location" type="text" value={profile.location} onChange={handleChange} placeholder="Not provided" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Encounter Data */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-2">2. Clinical Intake & Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Age</label>
                <input name="age" type="number" value={profile.age} onChange={handleChange} placeholder="--" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Gender</label>
                <select name="gender" value={profile.gender} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Blood Group</label>
                <select name="bloodGroup" value={profile.bloodGroup} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all">
                  <option value="">Select</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Weight (kg)</label>
                <input name="weight" type="text" value={profile.weight} onChange={handleChange} placeholder="--" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Symptoms / Encounter Issue</label>
                <textarea name="currentSymptoms" value={profile.currentSymptoms} onChange={handleChange} rows={2} placeholder="None recorded" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Medical Conditions & Allergies</label>
                <textarea name="allergies" value={profile.allergies} onChange={handleChange} rows={2} placeholder="None recorded" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Current Medications</label>
                <textarea name="medications" value={profile.medications} onChange={handleChange} rows={2} placeholder="None recorded" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Section 3: Insurance & Emergency Contacts */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-400 border-b border-slate-800 pb-2">3. Insurance & Emergency Protocol</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Insurance Provider</label>
                <input name="insuranceProvider" type="text" value={profile.insuranceProvider} onChange={handleChange} placeholder="Not provided" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Policy Number</label>
                <input name="insurancePolicyNo" type="text" value={profile.insurancePolicyNo} onChange={handleChange} placeholder="Not provided" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Emergency Contact Name</label>
                <input name="emergencyContactName" type="text" value={profile.emergencyContactName} onChange={handleChange} placeholder="Not provided" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Emergency Contact Phone</label>
                <input name="emergencyContactPhone" type="text" value={profile.emergencyContactPhone} onChange={handleChange} placeholder="Not provided" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-teal-500 transition-all" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-xl transition-all cursor-pointer">
            Save Changes
          </button>
        </form>

      </div>

      {/* Test Reports Modal Viewer */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-6 rounded-3xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-teal-400">Available Diagnostic Reports</h2>
                <p className="text-xs text-slate-400">Synced clinical consultation logs</p>
              </div>
              <button onClick={() => { setIsReportModalOpen(false); setSelectedReport(null); }} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
            </div>

            {selectedReport ? (
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-base">{selectedReport.title}</h3>
                  <span className="text-xs text-teal-400 bg-teal-950 border border-teal-800 px-2.5 py-1 rounded-lg">{selectedReport.lab}</span>
                </div>
                <p className="text-xs text-slate-400">Date Logged: {selectedReport.date}</p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-sm text-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Findings</p>
                  {selectedReport.findings}
                </div>
                <button onClick={() => setSelectedReport(null)} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer">
                  &larr; Back to Reports List
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {testReports.map((rep) => (
                  <div key={rep.id || rep.title} onClick={() => setSelectedReport(rep)} className="p-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl flex justify-between items-center transition-all cursor-pointer">
                    <div>
                      <p className="font-bold text-sm text-white">{rep.title}</p>
                      <p className="text-xs text-slate-400">{rep.lab} • {rep.date}</p>
                    </div>
                    <span className="text-xs font-bold text-teal-400">View &rarr;</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}