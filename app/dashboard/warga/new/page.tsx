import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { WargaForm } from '@/components/forms/WargaForm';

export default async function NewWargaPage() {
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

  // Check permission
  if (!['ketua_rw', 'ketua_rt', 'koordinator_rw'].includes(role)) {
    redirect('/dashboard/warga');
  }

  // Fetch RT list for dropdown
  const { data: rtList } = await supabase
    .from('rt')
    .select('id, kode, nama')
    .order('kode', { ascending: true });

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ email: user.email || '', role: getRoleLabel(role) }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tambah Warga Baru</h2>
          <p className="text-gray-600">
            Isi semua field dengan lengkap. Gunakan "N/A" jika data tidak tersedia.
          </p>
        </div>

        <WargaForm 
          rtList={rtList || []} 
          mode="create"
        />
      </main>
    </div>
  );
}
