import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getKKWithMembers } from '@/app/actions/kk';

export default async function KKDetailPage({ params }: { params: { id: string } }) {
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

  // Get KK with members
  const kkData = await getKKWithMembers(parseInt(params.id));

  if (!kkData) {
    redirect('/dashboard/kk');
  }

  const isAdmin = ['ketua_rw', 'koordinator_rw', 'ketua_rt'].includes(role);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout user={{ email: user.email || '', role: getRoleLabel(role) }}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Kartu Keluarga</h1>
            <p className="text-gray-600 mt-1">
              Informasi lengkap KK dan anggota keluarga
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <a
                href={`/dashboard/kk/${kkData.id}/edit`}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Edit KK
              </a>
            )}
            <a
              href="/dashboard/kk"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Kembali
            </a>
          </div>
        </div>

        {/* KK Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kartu Keluarga</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nomor KK</label>
              <p className="text-base font-semibold text-gray-900">{kkData.no_kk}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Kepala Keluarga</label>
              <p className="text-base font-semibold text-gray-900">{kkData.nama_kepala_keluarga}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">RT</label>
              <p className="text-base text-gray-900">
                {kkData.rts ? `${kkData.rts.kode} - ${kkData.rts.nama}` : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Tanggal Mulai Menghuni</label>
              <p className="text-base text-gray-900">
                {new Date(kkData.tanggal_mulai_huni).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Alamat</label>
              <p className="text-base text-gray-900">{kkData.alamat || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                kkData.status === 'aktif' 
                  ? 'bg-green-100 text-green-800' 
                  : kkData.status === 'pindah'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {kkData.status === 'aktif' ? 'Aktif' : kkData.status === 'pindah' ? 'Pindah' : 'Tidak Aktif'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Jumlah Anggota</label>
              <p className="text-base font-semibold text-blue-600">{kkData.members.length} orang</p>
            </div>
          </div>
        </div>

        {/* Family Members */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Anggota Keluarga</h2>
            <p className="text-sm text-gray-600 mt-1">
              Daftar seluruh anggota dalam KK ini
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Kelamin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Lahir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Umur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pekerjaan
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kkData.members.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                      Belum ada anggota keluarga terdaftar
                    </td>
                  </tr>
                ) : (
                  kkData.members.map((member: any) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.nik}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(member.tanggal_lahir).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(member.tanggal_lahir)} tahun
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.pekerjaan}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={`/dashboard/warga/${member.id}/edit`}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            Edit
                          </a>
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
