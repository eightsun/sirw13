import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { 
  UsersIcon, 
  HomeIcon, 
  UserGroupIcon,
  ChartBarIcon 
} from '@heroicons/react/24/solid';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }

  // Get user role
  const { data: userRoleData } = await supabase
    .from('user_roles')
    .select('role, rt_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const role = userRoleData?.role || 'warga';

  // Check if user has warga entry
  const { data: existingWarga } = await supabase
    .from('persons')
    .select('*')
    .eq('email', user.email)
    .is('deleted_at', null)
    .maybeSingle();

  // If no warga entry, create one with minimal data
  if (!existingWarga) {
    console.log('No warga entry found for', user.email, '- creating...');
    
    const userName = user.user_metadata?.nama || user.email?.split('@')[0] || 'User';
    
    const { error: createError } = await supabase
      .from('persons')
      .insert({
        email: user.email,
        nama: userName,
        nik: '0000000000000000', // Placeholder - user will update
        no_kk: '0000000000000000', // Placeholder
        rt_id: 1, // Default RT 01
        tempat_lahir: 'N/A',
        tanggal_lahir: '2000-01-01',
        jenis_kelamin: 'L',
        agama: 'islam',
        status_perkawinan: 'belum_kawin',
        pendidikan: 'sma',
        pekerjaan: 'N/A',
        alamat: 'N/A',
        no_hp: '',
      });

    if (createError) {
      console.error('Error creating warga entry:', createError);
    } else {
      console.log('Warga entry created successfully');
    }
    
    // Redirect to profile edit to complete data
    redirect('/dashboard/profile/edit');
  }

  // Check if profile is complete (required fields filled)
  const hasValidNik = existingWarga.nik && 
                     existingWarga.nik.length === 16 && 
                     existingWarga.nik !== '0000000000000000';
  const hasValidAlamat = existingWarga.alamat && 
                        existingWarga.alamat.trim() !== '' && 
                        existingWarga.alamat !== 'N/A';
  const hasPhone = existingWarga.no_hp && existingWarga.no_hp.trim() !== '';
  
  const profileComplete = hasValidNik && hasValidAlamat && hasPhone;

  if (!profileComplete) {
    // Redirect to profile edit to complete missing data
    redirect('/dashboard/profile/edit');
  }

  // Get statistics
  const { count: totalWarga } = await supabase
    .from('persons')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: totalKK } = await supabase
    .from('households')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: totalRumah } = await supabase
    .from('houses')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  const { count: rumahKosong } = await supabase
    .from('houses')
    .select('*', { count: 'exact', head: true })
    .eq('status_huni', 'kosong')
    .is('deleted_at', null);

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'ketua_rw': 'Ketua RW',
      'koordinator_rw': 'Koordinator RW',
      'ketua_rt': 'Ketua RT',
      'warga': 'Warga',
    };
    return roleMap[role] || role;
  };

  return (
    <DashboardLayout user={{ email: user.email || '', role: getRoleLabel(role) }}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Selamat datang kembali, <span className="font-medium text-purple-600">{existingWarga.nama}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Warga"
            value={totalWarga || 0}
            icon={<UsersIcon className="w-6 h-6 text-white" />}
            color="purple"
            trend={{ value: '12% dari bulan lalu', isPositive: true }}
          />
          
          <StatsCard
            title="Total KK"
            value={totalKK || 0}
            icon={<UserGroupIcon className="w-6 h-6 text-white" />}
            color="blue"
            trend={{ value: '8% dari bulan lalu', isPositive: true }}
          />
          
          <StatsCard
            title="Total Rumah"
            value={totalRumah || 0}
            icon={<HomeIcon className="w-6 h-6 text-white" />}
            color="green"
          />
          
          <StatsCard
            title="Rumah Kosong"
            value={rumahKosong || 0}
            icon={<ChartBarIcon className="w-6 h-6 text-white" />}
            color="orange"
          />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Aktivitas Terbaru</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UsersIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Warga baru ditambahkan</p>
                  <p className="text-sm text-gray-500 truncate">3 warga baru telah terdaftar di sistem</p>
                  <p className="text-xs text-gray-400 mt-1">2 jam yang lalu</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserGroupIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Data KK diperbarui</p>
                  <p className="text-sm text-gray-500 truncate">5 data KK telah diverifikasi</p>
                  <p className="text-xs text-gray-400 mt-1">5 jam yang lalu</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HomeIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Rumah baru didaftarkan</p>
                  <p className="text-sm text-gray-500 truncate">2 rumah baru di Discovery Barat</p>
                  <p className="text-xs text-gray-400 mt-1">1 hari yang lalu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="space-y-3">
              {(role === 'ketua_rw' || role === 'koordinator_rw' || role === 'ketua_rt') && (
                <>
                  <a
                    href="/dashboard/warga/new"
                    className="block w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-medium"
                  >
                    + Tambah Warga
                  </a>
                  
                  <a
                    href="/dashboard/kk/new"
                    className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                  >
                    + Tambah KK
                  </a>
                  
                  <a
                    href="/dashboard/rumah/new"
                    className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
                  >
                    + Tambah Rumah
                  </a>
                </>
              )}

              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Profil Saya</p>
                <a
                  href="/dashboard/profile/edit"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  ✏️ Edit Profil
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
