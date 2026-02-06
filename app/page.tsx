import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary-900 mb-4">
            SIRW13
          </h1>
          <p className="text-xl text-primary-700 mb-2">
            Sistem Informasi Rukun Warga 13
          </p>
          <p className="text-lg text-primary-600">
            Permata Discovery
          </p>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manajemen Warga</h3>
            <p className="text-gray-600">Kelola data warga, KK, dan rumah secara terpusat dan aman</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keamanan Data</h3>
            <p className="text-gray-600">Akses berbasis peran dengan Row Level Security</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Laporan & Statistik</h3>
            <p className="text-gray-600">Dashboard dan laporan lengkap per RT dan RW</p>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Akses Sistem
          </h2>
          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="block w-full bg-primary-600 text-white text-center px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              className="block w-full bg-white text-primary-600 text-center px-6 py-3 rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors font-medium"
            >
              Daftar Akun Baru
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-600 text-center">
            Sistem ini khusus untuk warga RW 13 Permata Discovery
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p className="mb-2">© 2024 RW 13 Permata Discovery</p>
          <p className="text-sm">Dibuat dengan ❤️ untuk kemajuan RW 13</p>
        </div>
      </div>
    </main>
  );
}
