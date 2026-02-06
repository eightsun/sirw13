'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createWarga(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
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
    email: formData.get('email') as string,
  };

  // Check if household exists, if not create it
  const { data: existingHousehold } = await supabase
    .from('households')
    .select('no_kk')
    .eq('no_kk', data.no_kk)
    .maybeSingle();

  if (!existingHousehold) {
    // Create household first
    const { error: hhError } = await supabase
      .from('households')
      .insert({
        no_kk: data.no_kk,
        nama_kepala_keluarga: data.nama,
        tanggal_mulai_tinggal: new Date().toISOString().split('T')[0],
        status: 'aktif',
      });

    if (hhError) {
      console.error('Household creation error:', hhError);
      return { error: 'Gagal membuat data KK: ' + hhError.message };
    }
  }

  // Handle photo upload
  const photoFile = formData.get('photo') as File;
  let photoUrl = null;

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

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: 'Gagal upload foto' };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('warga-photos')
      .getPublicUrl(filePath);

    photoUrl = publicUrl;
  }

  // Insert person
  const { error } = await supabase
    .from('persons')
    .insert({
      ...data,
      extra_fields: photoUrl ? { photo_url: photoUrl } : null,
    });

  if (error) {
    console.error('Database error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/warga');
  redirect('/dashboard/warga');
}

export async function updateWarga(id: number, formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
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
    email: formData.get('email') as string,
  };

  // Check if household exists for new no_kk
  const { data: existingHousehold } = await supabase
    .from('households')
    .select('no_kk')
    .eq('no_kk', data.no_kk)
    .maybeSingle();

  if (!existingHousehold) {
    // Create household if changing to new KK
    const { error: hhError } = await supabase
      .from('households')
      .insert({
        no_kk: data.no_kk,
        nama_kepala_keluarga: data.nama,
        tanggal_mulai_tinggal: new Date().toISOString().split('T')[0],
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
    .eq('id', id);

  if (error) {
    console.error('Database error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/warga');
  redirect('/dashboard/warga');
}

export async function deleteWarga(id: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Soft delete
  const { error } = await supabase
    .from('persons')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/warga');
  return { success: true };
}
