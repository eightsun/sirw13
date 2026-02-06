import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { calculateAge } from '@/lib/utils/helpers';

export default async function WargaPage() {
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

  // Fetch warga data
  const { data: wargaList, error: fetchError } = await supabase
    .from('persons')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50);

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'ketua_rw': 'Ketua RW',
      'koordinator_rw': 'Koordinator RW',
      'ketua_rt': 'Ketua RT',
      'warga': 'Warga',
    };
    return roleMap[role] || role;
  };

  const rtMap: Record<number, string> = {
    1: 'RT 01', 2: 'RT 02', 3: 'RT 03',
    4: 'RT 04', 5: 'RT 05', 6: 'RT 06',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ email: user.email || '', role: getRoleLabel(role) }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Warga</h2>
            <p className="text-gray-600">Kelola data warga RW 13 Permata Discovery</p>
          </div>
          {(role === 'ketua_rw' || role === 'ketua_rt' || role === 'koordinator_rw') && (
            <Link 
              href="/dashboard/warga/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Tambah Warga
            </Link>
          )}
        </div>

        {fetchError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {fetchError.message}</p>
          </div>
        )}

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Total: <strong>{wargaList?.length || 0}</strong> warga
            </p>
            <div className="text-sm text-gray-500">
              Role: <strong>{getRoleLabel(role)}</strong>
            </div>
          </div>

          {wargaList && wargaList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No HP</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wargaList.map((warga: any) => {
                    const nik = warga.nik || '';
                    const maskedNik = role === 'warga' && warga.user_id !== user.id 
                      ? `****-****-${nik.slice(-4)}` 
                      : nik;
                    const age = calculateAge(warga.tanggal_lahir);
                    const gender = warga.jenis_kelamin === 'L' ? 'Laki-laki' : warga.jenis_kelamin === 'P' ? 'Perempuan' : '-';
                    const rt = rtMap[warga.rt_id] || '-';
                    const noHp = (role === 'warga' && warga.user_id !== user.id) ? '***' : (warga.no_hp || '-');

                    return (
                      <tr key={warga.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{maskedNik}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{warga.nama}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{age ? `${age} tahun` : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{noHp}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-4 text-gray-600">Belum ada data warga</p>
            </div>
          )}
        </Card>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Informasi:</strong> Data yang ditampilkan disesuaikan dengan role Anda.
          </p>
        </div>
      </main>
    </div>
  );
}
