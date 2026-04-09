import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

import LearningBro from '../assets/Learning-bro.svg';
import LearningPana from '../assets/Learning-pana.svg';
import Beaker from '../assets/beaker chemistry-bro.svg';
import HappyAnnouncement from '../assets/Happy announcement-rafiki (1).svg';

type ClassLevel = '6' | '7' | '8' | '9' | '10';

export default function Signup() {
  const navigate = useNavigate();

  const classLevels = useMemo<ClassLevel[]>(() => ['6', '7', '8', '9', '10'], []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>('10');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit =
    name.trim().length >= 2 &&
    email.trim().length > 0 &&
    phone.trim().length >= 10 &&
    password.length >= 6 &&
    !isLoading;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axiosInstance.post('/auth/signup', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        classLevel,
      });

      // Show success modal (student is pending approval, per backend rules)
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-88px)] px-4 py-10 relative">
      {/* Orange corner fills (FF5722) like your sketch */}
      <div
        className="pointer-events-none absolute left-0 bottom-0 h-44 w-64 bg-brand-orange/25"
        style={{
          borderTopRightRadius: 80,
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(17,17,17,0.28) 0px, rgba(17,17,17,0.28) 6px, rgba(255,87,34,0.0) 6px, rgba(255,87,34,0.0) 14px)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-44 w-64 bg-brand-orange/25"
        style={{
          borderBottomLeftRadius: 80,
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(17,17,17,0.28) 0px, rgba(17,17,17,0.28) 6px, rgba(255,87,34,0.0) 6px, rgba(255,87,34,0.0) 14px)',
        }}
        aria-hidden="true"
      />

      {/* Static illustration background (no sketches, no animation) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={LearningPana}
          alt=""
          className="absolute -left-28 top-10 w-[360px] max-w-none opacity-25 lg:opacity-95 lg:left-0 lg:top-24 lg:w-[420px]"
        />
        <img
          src={LearningBro}
          alt=""
          className="absolute -right-28 top-8 w-[360px] max-w-none opacity-25 lg:opacity-95 lg:right-0 lg:top-20 lg:w-[420px]"
        />
        <img
          src={Beaker}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 bottom-[-120px] w-[520px] max-w-none opacity-15 lg:opacity-20 lg:bottom-[-160px]"
        />
      </div>

      <div className="mx-auto w-full max-w-6xl relative z-10 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border-4 border-brand-black p-8 shadow-solid relative">
          {/* Orange corner accents behind card */}
          <div className="absolute -left-6 -top-6 h-20 w-24 bg-brand-orange/30 border-4 border-brand-black shadow-solid-sm rounded-[22px] -z-10" />
          <div className="absolute -right-6 -bottom-6 h-20 w-24 bg-brand-orange/30 border-4 border-brand-black shadow-solid-sm rounded-[22px] -z-10" />

            <div className="mb-6">
              <div className="inline-block px-3 py-1 border-2 border-brand-black bg-brand-orange text-brand-black font-bold text-xs uppercase tracking-wider shadow-solid-sm">
                Student Signup
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-black uppercase">Create Account</h1>
              <p className="mt-2 font-medium text-brand-black/70">
                Your account will be <span className="font-black">pending</span> until the admin approves it.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-brand-black text-red-600 font-bold text-sm shadow-solid-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block font-bold uppercase text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border-2 border-brand-black focus:outline-none focus:shadow-solid-sm transition-shadow font-medium bg-white"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-sm mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border-2 border-brand-black focus:outline-none focus:shadow-solid-sm transition-shadow font-medium bg-white"
                  placeholder="student@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border-2 border-brand-black focus:outline-none focus:shadow-solid-sm transition-shadow font-medium bg-white"
                    placeholder="9999999999"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-sm mb-2">Class</label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                    className="w-full p-3 border-2 border-brand-black focus:outline-none focus:shadow-solid-sm transition-shadow font-bold bg-white"
                  >
                    {classLevels.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-sm mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border-2 border-brand-black focus:outline-none focus:shadow-solid-sm transition-shadow font-medium bg-white"
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-4 bg-brand-orange border-2 border-brand-black font-bold text-lg shadow-solid hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid-hover active:translate-y-0 active:translate-x-0 active:shadow-none transition-all disabled:opacity-70"
              >
                {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
              </button>
            </form>

            <div className="mt-6 border-t-2 border-brand-black/10 pt-4 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-black underline underline-offset-4 hover:text-brand-orange">
                Sign in
              </Link>
            </div>
          </div>
      </div>

      {/* Success modal */}
      {showSuccessModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-brand-black/60"
            onClick={() => setShowSuccessModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white border-4 border-brand-black shadow-solid">
            {/* Banner strip with exact text */}
            <div className="bg-brand-orange border-b-4 border-brand-black p-4">
              <div className="text-white font-black uppercase tracking-wide">
                Account created successfully . waiting for the admin approval.
              </div>
            </div>

            <div className="p-6">
              <img src={HappyAnnouncement} alt="Account created" className="w-full h-64 object-contain" />

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/login');
                  }}
                  className="flex-1 py-3 bg-brand-orange border-2 border-brand-black font-bold uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                >
                  Go to Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-3 bg-white border-2 border-brand-black font-bold uppercase shadow-solid-sm hover:-translate-y-1 hover:-translate-x-1 hover:shadow-solid active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

