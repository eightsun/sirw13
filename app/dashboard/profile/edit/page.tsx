import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WargaForm } from '@/components/forms/WargaForm';

export default async function ProfileEditPage() {
  const supabase = await createClient();
  
  // Check authentication
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

  // Check if user has warga entry
  const { data: warga } = await supabase
    .from('persons')
    .select('*')
    .eq('email', user.email)
    .is('deleted_at', null)
    .maybeSingle();
  
  // If no warga entry, create one
  if (!warga) {
    console.log('No warga entry found in profile edit, creating...');
    
    const userName = user.user_metadata?.nama || user.email?.split('@')[0] || 'User';
    
    const { data: newWarga, error: createError } = await supabase
      .from('persons')
      .insert({
        email: user.email,
        nama: userName,
        nik: '0000000000000000',
        no_kk: '0000000000000000',
        rt_id: 1,
        tempat_lahir: 'N/A',
        tanggal_lahir: '2000-01-01',
        jenis_kelamin: 'L',
        agama: 'islam',
        status_perkawinan: 'belum_kawin',
        pendidikan: 'sma',
        pekerjaan: 'N/A',
        alamat: 'N/A',
        no_hp: '',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating warga entry:', createError);
      return (
        <DashboardLayout user={{ email: user.email || '', role: getRoleLabel(role) }}>
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error: Gagal membuat profil. Silakan hubungi admin.
              </p>
              <p className="text-sm text-red-600 mt-2">
                Detail: {createError.message}
              </p>
            </div>
          </div>
        </DashboardLayout>
      );
    }

    // Use newly created warga data
    const finalWarga = newWarga;

    // Get RT list for dropdown
    const { data: rtList } = await supabase
      .from('rts')
      .select('id, kode, nama')
      .order('kode');

    return (
      <DashboardLayout user={{ email: user.email || '', role: getRoleLabel(role) }}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Lengkapi Profil Anda
            </h1>
            <p className="text-gray-600">
              Silakan lengkapi data diri Anda untuk dapat menggunakan sistem sepenuhnya.
            </p>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Penting:</strong> Pastikan semua data yang Anda masukkan sesuai dengan KTP Anda.
                Data NIK, Nomor KK, dan informasi lainnya akan diverifikasi oleh admin RT/RW.
              </p>
            </div>
          </div>

          <WargaForm 
            warga={finalWarga} 
            rtList={rtList || []} 
            mode="edit"
            isProfileMode={true}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Warga entry exists, show form
  const { data: rtList } = await supabase
    .from('rts')
    .select('id, kode, nama')
    .order('kode');

  return (
    <DashboardLayout user={{ email: user.email || '', role: getRoleLabel(role) }}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lengkapi Profil Anda
          </h1>
          <p className="text-gray-600">
            Silakan lengkapi data diri Anda untuk dapat menggunakan sistem sepenuhnya.
          </p>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Penting:</strong> Pastikan semua data yang Anda masukkan sesuai dengan KTP Anda.
              Data NIK, Nomor KK, dan informasi lainnya akan diverifikasi oleh admin RT/RW.
            </p>
          </div>
        </div>

        <WargaForm 
          warga={warga} 
          rtList={rtList || []} 
          mode="edit"
          isProfileMode={true}
        />
      </div>
    </DashboardLayout>
  );
}
