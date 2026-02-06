import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function NewWargaPage() {
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

  // Check authorization
  if (role === 'warga') {
    redirect('/dashboard');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ email: user.email, role: getRoleLabel(role) }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tambah Warga Baru</h2>
          <p className="text-gray-600">
            Form untuk menambahkan data warga baru
          </p>
        </div>

        <Card>
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Form Tambah Warga</h3>
            <p className="mt-2 text-gray-600">
              Fitur form input sedang dalam pengembangan.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Untuk sementara, tambahkan data warga melalui SQL Editor di Supabase Dashboard.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/warga">
                <Button>
                  ← Kembali ke Daftar Warga
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
