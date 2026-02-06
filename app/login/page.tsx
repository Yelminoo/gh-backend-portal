'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 via-primary-100 to-primary-200">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-xl border border-primary-200">
        <div>
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 5 L45 20 L30 55 L15 20 Z" fill="#B6771D" opacity="0.9"/>
              <path d="M30 5 L37.5 20 L30 35 L22.5 20 Z" fill="#FF9D00"/>
              <path d="M30 35 L37.5 20 L45 20 L30 55 Z" fill="#FFCF71" opacity="0.8"/>
              <path d="M30 35 L22.5 20 L15 20 L30 55 Z" fill="#FFCF71" opacity="0.8"/>
              <path d="M30 5 L22.5 20 L15 20 Z" fill="#7B542F" opacity="0.7"/>
              <path d="M30 5 L37.5 20 L45 20 Z" fill="#7B542F" opacity="0.7"/>
              <circle cx="30" cy="22.5" r="4" fill="#FFCF71" opacity="0.6"/>
            </svg>
          </div>
          
          <h2 className="text-center text-3xl font-extrabold text-primary-900">
            Sign in to GemHaven
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Admin Portal
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm font-medium"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm font-medium"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
