import { createClient } from '@/lib/supabase/server';

/**
 * Get warga data for currently logged-in user
 */
export async function getUserWarga() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: warga } = await supabase
    .from('persons')
    .select('*')
    .eq('email', user.email)
    .is('deleted_at', null)
    .maybeSingle();

  return warga;
}

/**
 * Check if user profile is complete
 * Profile is complete if user has:
 * - NIK (16 digits)
 * - Alamat (not empty)
 * - No HP (not empty)
 */
export async function isProfileComplete() {
  const warga = await getUserWarga();
  
  if (!warga) return false;
  
  // Check required fields
  const hasNik = warga.nik && warga.nik.length === 16;
  const hasAlamat = warga.alamat && warga.alamat.trim() !== '' && warga.alamat !== 'N/A';
  const hasPhone = warga.no_hp && warga.no_hp.trim() !== '';
  
  return hasNik && hasAlamat && hasPhone;
}

/**
 * Create basic warga record for new user
 */
export async function createUserWarga(email: string, nama: string) {
  const supabase = await createClient();
  
  // Check if already exists
  const { data: existing } = await supabase
    .from('persons')
    .select('id')
    .eq('email', email)
    .is('deleted_at', null)
    .maybeSingle();
  
  if (existing) return existing;
  
  const placeholderNoKK = '0000000000000000';
  
  // First, create household if doesn't exist
  const { data: existingHousehold } = await supabase
    .from('households')
    .select('no_kk')
    .eq('no_kk', placeholderNoKK)
    .maybeSingle();
  
  if (!existingHousehold) {
    console.log('Creating placeholder household for new user...');
    const { error: hhError } = await supabase
      .from('households')
      .insert({
        no_kk: placeholderNoKK,
        nama_kepala_keluarga: nama,
        tanggal_mulai_huni: new Date().toISOString().split('T')[0],
        status: 'aktif',
      });
    
    if (hhError) {
      console.error('Error creating household:', hhError);
    }
  }
  
  // Create minimal person record
  const { data, error } = await supabase
    .from('persons')
    .insert({
      email: email,
      nama: nama,
      nik: '0000000000000000', // Placeholder - user will update
      no_kk: placeholderNoKK, // Placeholder
      rt_id: 1, // Default RT 01
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
  
  if (error) {
    console.error('Error creating user warga:', error);
    return null;
  }
  
  return data;
}
