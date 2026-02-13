import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-100 via-primary-200 to-primary-300">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer diamond/gem shape */}
            <path d="M60 10 L90 40 L60 110 L30 40 Z" fill="#B6771D" opacity="0.9"/>
            {/* Inner facets */}
            <path d="M60 10 L75 40 L60 70 L45 40 Z" fill="#FF9D00"/>
            <path d="M60 70 L75 40 L90 40 L60 110 Z" fill="#FFCF71" opacity="0.8"/>
            <path d="M60 70 L45 40 L30 40 L60 110 Z" fill="#FFCF71" opacity="0.8"/>
            {/* Top facets */}
            <path d="M60 10 L45 40 L30 40 Z" fill="#7B542F" opacity="0.7"/>
            <path d="M60 10 L75 40 L90 40 Z" fill="#7B542F" opacity="0.7"/>
            {/* Center highlight */}
            <circle cx="60" cy="45" r="8" fill="#FFCF71" opacity="0.6"/>
          </svg>
        </div>
       
        <h1 className="text-6xl font-bold text-primary-900 mb-4">
          GemHaven
        </h1>
        <p className="text-2xl text-primary-800 mb-8">
          Multivendor Jewelry Marketplace
        </p>
        <p className="text-xl text-primary-700 mb-12">
          Admin Portal
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-block px-8 py-3 border-2 border-primary-600 text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 shadow-md hover:shadow-lg transition-all"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
