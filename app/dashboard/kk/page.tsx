import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';

export default async function KKPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role = userRoles?.role || 'warga';

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Kartu Keluarga (KK)</h2>
          <p className="text-gray-600">
            Kelola data Kartu Keluarga RW 13 Permata Discovery
          </p>
        </div>

        <Card>
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Halaman Data KK</h3>
            <p className="mt-2 text-gray-600">
              Fitur ini sedang dalam pengembangan.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Untuk sementara, gunakan halaman Data Warga untuk melihat informasi KK.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
