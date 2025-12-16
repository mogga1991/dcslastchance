'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const FedSpaceSignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setFormVisible(true), 300);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      router.push('/dashboard/gsa-leasing');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full transition-colors duration-300 bg-slate-50">
      <div className="flex min-h-screen items-center justify-center p-4 md:p-0">
        <div className={`w-full max-w-6xl overflow-hidden rounded-2xl transition-all duration-500 bg-white shadow-xl shadow-gray-200 ${formVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

          <div className="flex flex-col md:flex-row">
            {/* Left side - Statistics and Images Collage */}
            <div className="hidden md:block w-full md:w-3/5 bg-gray-100 p-6">
              <div className="grid grid-cols-2 grid-rows-3 gap-4 h-full overflow-hidden">
                {/* Top left - Office Building */}
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                    alt="Modern office building"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Top right - Indigo stat (GSA Spending) */}
                <div
                  className="rounded-xl flex flex-col justify-center items-center p-6 text-white bg-indigo-600"
                  style={{
                    transform: formVisible ? 'translateY(0)' : 'translateY(20px)',
                    opacity: formVisible ? 1 : 0,
                    transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                    transitionDelay: '0.2s',
                  }}
                >
                  <h2 className="text-5xl font-bold mb-2">$6B+</h2>
                  <p className="text-center text-sm">GSA spends over six billion dollars every year on leased office and commercial space across the United States.</p>
                </div>

                {/* Middle left - Conference Room */}
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80"
                    alt="Conference room"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Middle right - Office Interior */}
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80"
                    alt="Modern office interior"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom left - Green stat (Active Leases) */}
                <div
                  className="rounded-xl flex flex-col justify-center items-center p-6 text-white bg-emerald-600"
                  style={{
                    transform: formVisible ? 'translateY(0)' : 'translateY(20px)',
                    opacity: formVisible ? 1 : 0,
                    transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
                    transitionDelay: '0.4s',
                  }}
                >
                  <h2 className="text-5xl font-bold mb-2">8,000+</h2>
                  <p className="text-center text-sm">GSA manages more than eight thousand active lease contracts annually through the Public Buildings Service (PBS).</p>
                </div>

                {/* Bottom right - Office Workspace */}
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                    alt="Office workspace"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right side - Sign in form */}
            <div
              className="w-full md:w-2/5 p-8 md:p-12 bg-white text-gray-900"
              style={{
                transform: formVisible ? 'translateX(0)' : 'translateX(20px)',
                opacity: formVisible ? 1 : 0,
                transition: 'transform 0.6s ease-out, opacity 0.6s ease-out'
              }}
            >
              <div className="flex justify-end mb-6">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?
                  <Link href="/sign-up" className="ml-1 font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                  </Link>
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-indigo-600">FedSpace</span>
                </div>
                <h1 className="text-2xl font-bold mb-1 text-gray-900">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-600">
                  Sign in to access federal lease opportunities and manage your property listings.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 py-3 px-4 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex w-full justify-center rounded-lg py-3 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-300 bg-indigo-600 hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { FedSpaceSignIn };
