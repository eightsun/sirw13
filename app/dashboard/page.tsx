import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }

  // Get user role
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role, rt_id, rt:rt_id(kode, nama)')
    .eq('user_id', user.id)
    .order('role', { ascending: true })
    .limit(1)
    .single();

  const role = userRoles?.role || 'warga';
  const rtInfo = userRoles?.rt as any;

  // Get stats
  const { count: totalWarga } = await supabase
    .from('persons')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: totalKK } = await supabase
    .from('households')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('status', 'aktif');

  const { count: totalRumah } = await supabase
    .from('houses')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: rumahBerpenghuni } = await supabase
    .from('houses')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('status_huni', 'berpenghuni');

  const rumahKosong = (totalRumah || 0) - (rumahBerpenghuni || 0);

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'ketua_rw': 'Ketua RW',
      'koordinator_rw': 'Koordinator RW',
      'ketua_rt': `Ketua RT - ${rtInfo?.kode || ''}`,
      'warga': 'Warga',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ email: user.email, role: getRoleLabel(role) }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Selamat Datang di SIRW13
          </h2>
          <p className="text-gray-600">
            Sistem Informasi Rukun Warga 13 Permata Discovery
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Warga</p>
                <p className="text-3xl font-bold text-gray-900">{totalWarga || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total KK</p>
                <p className="text-3xl font-bold text-gray-900">{totalKK || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Rumah</p>
                <p className="text-3xl font-bold text-gray-900">{totalRumah || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rumah Kosong</p>
                <p className="text-3xl font-bold text-gray-900">{rumahKosong}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Menu Cards */}
        <Card title="Menu Utama" className="mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/dashboard/warga" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-900 mb-1">Data Warga</h4>
              <p className="text-sm text-gray-600">Kelola data warga</p>
            </Link>
            <Link 
              href="/dashboard/kk" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-900 mb-1">Data KK</h4>
              <p className="text-sm text-gray-600">Kelola Kartu Keluarga</p>
            </Link>
            <Link 
              href="/dashboard/rumah" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all"
            >
              <h4 className="font-medium text-gray-900 mb-1">Data Rumah</h4>
              <p className="text-sm text-gray-600">Kelola data rumah</p>
            </Link>
            <div className="block p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-500 mb-1">Laporan</h4>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            🎉 Sistem Siap Digunakan
          </h3>
          <p className="text-primary-800 mb-4">
            Database dan RLS sudah aktif. Anda dapat mulai mengelola data warga, KK, dan rumah sesuai dengan role Anda.
          </p>
          <ul className="text-sm text-primary-700 space-y-1">
            <li>✅ CRUD Data Warga, KK, dan Rumah</li>
            <li>✅ Row Level Security (RLS) aktif</li>
            <li>✅ Dashboard dengan statistik real-time</li>
            <li>✅ Role-based access control</li>
            <li>🔜 Fase 2: Iuran Fasilitas Bulanan (coming soon)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
