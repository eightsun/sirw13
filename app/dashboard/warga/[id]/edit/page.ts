import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { WargaForm } from '@/components/forms/WargaForm';
import { notFound } from 'next/navigation';

interface EditWargaPageProps {
  params: {
    id: string;
  };
}

export default async function EditWargaPage({ params }: EditWargaPageProps) {
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

  // Check permission
  if (!['ketua_rw', 'ketua_rt', 'koordinator_rw'].includes(role)) {
    redirect('/dashboard/warga');
  }

  // Fetch warga data
  const { data: warga, error: wargaError } = await supabase
    .from('persons')
    .select('*')
    .eq('id', params.id)
    .is('deleted_at', null)
    .single();

  if (wargaError || !warga) {
    notFound();
  }

  // Check RT permission for ketua_rt
  if (role === 'ketua_rt' && warga.rt_id !== userRoleData?.rt_id) {
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Data Warga</h2>
          <p className="text-gray-600">
            Update data warga: <strong>{warga.nama}</strong>
          </p>
        </div>

        <WargaForm 
          warga={warga}
          rtList={rtList || []} 
          mode="edit"
        />
      </main>
    </div>
  );
}