'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Get user's warga data
  const { data: existingWarga } = await supabase
    .from('persons')
    .select('id')
    .eq('email', user.email)
    .is('deleted_at', null)
    .maybeSingle();

  if (!existingWarga) {
    return { error: 'Data profil tidak ditemukan' };
  }

  const data = {
    nik: formData.get('nik') as string,
    no_kk: formData.get('no_kk') as string,
    rt_id: parseInt(formData.get('rt_id') as string),
    nama: formData.get('nama') as string,
    tempat_lahir: formData.get('tempat_lahir') as string,
    tanggal_lahir: formData.get('tanggal_lahir') as string,
    jenis_kelamin: formData.get('jenis_kelamin') as string,
    agama: formData.get('agama') as string,
    status_perkawinan: formData.get('status_perkawinan') as string,
    pendidikan: formData.get('pendidikan') as string,
    pekerjaan: formData.get('pekerjaan') as string,
    alamat: formData.get('alamat') as string,
    no_hp: formData.get('no_hp') as string,
    email: user.email, // Keep user's email
  };

  // Check if household exists for this no_kk
  const { data: existingHousehold } = await supabase
    .from('households')
    .select('no_kk')
    .eq('no_kk', data.no_kk)
    .maybeSingle();

  if (!existingHousehold) {
    // Create household if doesn't exist
    const { error: hhError } = await supabase
      .from('households')
      .insert({
        no_kk: data.no_kk,
        nama_kepala_keluarga: data.nama,
        tanggal_mulai_huni: new Date().toISOString().split('T')[0],
        status: 'aktif',
      });

    if (hhError) {
      console.error('Household creation error:', hhError);
      return { error: 'Gagal membuat data KK: ' + hhError.message };
    }
  }

  // Handle photo upload (if new photo)
  const photoFile = formData.get('photo') as File;
  let updateData: any = { ...data };

  if (photoFile && photoFile.size > 0) {
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${data.nik}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('warga-photos')
      .upload(filePath, photoFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('warga-photos')
        .getPublicUrl(filePath);

      updateData.extra_fields = { photo_url: publicUrl };
    }
  }

  // Update database
  const { error } = await supabase
    .from('persons')
    .update(updateData)
    .eq('id', existingWarga.id);

  if (error) {
    console.error('Database error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/profile/edit');
  redirect('/dashboard');
}
