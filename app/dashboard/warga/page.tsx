'use client';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { formatDate, calculateAge } from '@/lib/utils/helpers';

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

  const columns = [
    {
      header: 'NIK',
      accessor: (row: any) => {
        const nik = row.nik || '';
        // Mask NIK untuk privacy
        if (role === 'warga' && row.user_id !== user.id) {
          return `****-****-${nik.slice(-4)}`;
        }
        return nik;
      },
    },
    {
      header: 'Nama',
      accessor: 'nama' as const,
    },
    {
      header: 'Umur',
      accessor: (row: any) => {
        const age = calculateAge(row.tanggal_lahir);
        return age ? `${age} tahun` : '-';
      },
    },
    {
      header: 'Jenis Kelamin',
      accessor: (row: any) => {
        return row.jenis_kelamin === 'L' ? 'Laki-laki' : row.jenis_kelamin === 'P' ? 'Perempuan' : '-';
      },
    },
    {
      header: 'RT',
      accessor: (row: any) => {
        const rtMap: Record<number, string> = {
          1: 'RT 01', 2: 'RT 02', 3: 'RT 03',
          4: 'RT 04', 5: 'RT 05', 6: 'RT 06',
        };
        return rtMap[row.rt_id] || '-';
      },
    },
    {
      header: 'No HP',
      accessor: (row: any) => {
        if (role === 'warga' && row.user_id !== user.id) {
          return '***';
        }
        return row.no_hp || '-';
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{ email: user.email || '', role: getRoleLabel(role) }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Warga</h2>
            <p className="text-gray-600">
              Kelola data warga RW 13 Permata Discovery
            </p>
          </div>
          {(role === 'ketua_rw' || role === 'ketua_rt' || role === 'koordinator_rw') && (
            <Link href="/dashboard/warga/new">
              <Button>+ Tambah Warga</Button>
            </Link>
          )}
        </div>

        {fetchError && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <p className="text-red-800">Error loading data: {fetchError.message}</p>
          </Card>
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
            <Table
              data={wargaList}
              columns={columns}
              emptyMessage="Belum ada data warga"
            />
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-4 text-gray-600">Belum ada data warga</p>
              {(role === 'ketua_rw' || role === 'ketua_rt' || role === 'koordinator_rw') && (
                <Link href="/dashboard/warga/new">
                  <Button className="mt-4">Tambah Warga Pertama</Button>
                </Link>
              )}
            </div>
          )}
        </Card>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Informasi:</strong> Data yang ditampilkan disesuaikan dengan role Anda. 
            {role === 'warga' && ' Sebagai warga, Anda hanya dapat melihat data terbatas untuk privasi.'}
            {role === 'ketua_rt' && ' Sebagai Ketua RT, Anda dapat melihat dan mengelola data warga di RT Anda.'}
            {(role === 'ketua_rw' || role === 'koordinator_rw') && ' Anda memiliki akses penuh ke semua data warga RW 13.'}
          </p>
        </div>
      </main>
    </div>
  );
}
