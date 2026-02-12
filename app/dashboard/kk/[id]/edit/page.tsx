import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KKForm } from '@/components/forms/KKForm';

export default async function EditKKPage({ params }: { params: { id: string } }) {
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

  // Check if user is admin
  const isAdmin = ['ketua_rw', 'koordinator_rw', 'ketua_rt'].includes(role);
  
  if (!isAdmin) {
    redirect('/dashboard/kk');
  }
  
  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      'ketua_rw': 'Ketua RW',
      'koordinator_rw': 'Koordinator RW',
      'ketua_rt': 'Ketua RT',
      'warga': 'Warga',
    };
    return roleMap[role] || role;
  };

  // Get KK data
  const { data: kk } = await supabase
    .from('households')
    .select('*')
    .eq('id', parseInt(params.id))
    .is('deleted_at', null)
    .single();

  if (!kk) {
    redirect('/dashboard/kk');
  }

  // Get RT list
  const { data: rtList } = await supabase
    .from('rts')
    .select('id, kode, nama')
    .order('kode');

  return (
    <DashboardLayout user={{ email: user.email || '', role: getRoleLabel(role) }}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Edit Kartu Keluarga
          </h1>
          <p className="text-gray-600">
            Update data Kartu Keluarga (KK)
          </p>
        </div>

        <KKForm kk={kk} rtList={rtList || []} mode="edit" />
      </div>
    </DashboardLayout>
  );
}
