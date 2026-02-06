import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';

export default async function RumahPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }

const { data: userRoles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .maybeSingle();

const role = (userRoles?.role as string) || 'warga';

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
      <Navbar user={{ email: user.email, role: getRoleLabel(role) }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Rumah</h2>
          <p className="text-gray-600">
            Kelola data rumah RW 13 Permata Discovery
          </p>
        </div>

        <Card>
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Halaman Data Rumah</h3>
            <p className="mt-2 text-gray-600">
              Fitur ini sedang dalam pengembangan.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Segera hadir: Daftar rumah, status hunian, dan kepemilikan.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
