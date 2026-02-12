import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { deleteKK } from '@/app/actions/kk';

export default async function KKPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }

  // Get user role
  const { data: userRoleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  const role = userRoleData?.role || 'warga';
  
  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'ketua_rw': 'Ketua RW',
      'koordinator_rw': 'Koordinator RW',
      'ketua_rt': 'Ketua RT',
      'warga': 'Warga',
    };
    return roleMap[role] || role;
  };

  // Get all KK with member count
  const { data: kkList } = await supabase
    .from('households')
    .select(`
      *,
      rts (
        id,
        kode,
        nama
      )
    `)
    .is('deleted_at', null)
    .order('no_kk');

  // Get member counts for each KK
  const kkWithCounts = await Promise.all(
    (kkList || []).map(async (kk) => {
      const { count } = await supabase
        .from('persons')
        .select('*', { count: 'exact', head: true })
        .eq('no_kk', kk.no_kk)
        .is('deleted_at', null);
      
      return {
        ...kk,
        member_count: count || 0,
      };
    })
  );

  const isAdmin = ['ketua_rw', 'koordinator_rw', 'ketua_rt'].includes(role);

  return (
    <DashboardLayout user={{ email: user.email || '', role: getRoleLabel(role) }}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Kartu Keluarga</h1>
            <p className="text-gray-600 mt-1">
              Kelola data Kartu Keluarga (KK) di RW 13
            </p>
          </div>
          {isAdmin && (
            <a
              href="/dashboard/kk/new"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              + Tambah KK
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total KK</p>
                <p className="text-2xl font-bold text-purple-600">{kkWithCounts.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">KK Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {kkWithCounts.filter(kk => kk.status === 'aktif').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Warga</p>
                <p className="text-2xl font-bold text-blue-600">
                  {kkWithCounts.reduce((sum, kk) => sum + kk.member_count, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* KK List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No KK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kepala Keluarga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anggota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kkWithCounts.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                      Belum ada data KK
                    </td>
                  </tr>
                ) : (
                  kkWithCounts.map((kk) => (
                    <tr key={kk.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {kk.no_kk}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kk.nama_kepala_keluarga}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kk.rts?.kode || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {kk.alamat || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {kk.member_count} orang
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          kk.status === 'aktif' 
                            ? 'bg-green-100 text-green-800' 
                            : kk.status === 'pindah'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {kk.status === 'aktif' ? 'Aktif' : kk.status === 'pindah' ? 'Pindah' : 'Tidak Aktif'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/dashboard/kk/${kk.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Lihat
                            </a>
                            <a
                              href={`/dashboard/kk/${kk.id}/edit`}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              Edit
                            </a>
                            <form action={deleteKK.bind(null, kk.id)} method="POST" className="inline">
                              <button
                                type="submit"
                                onClick={(e) => {
                                  if (!confirm('Yakin ingin menghapus KK ini?')) {
                                    e.preventDefault();
                                  }
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Hapus
                              </button>
                            </form>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
