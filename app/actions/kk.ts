'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Create new KK (Kartu Keluarga / Household)
 */
export async function createKK(formData: FormData) {
  const supabase = await createClient();

  const data = {
    no_kk: formData.get('no_kk') as string,
    nama_kepala_keluarga: formData.get('nama_kepala_keluarga') as string,
    rt_id: parseInt(formData.get('rt_id') as string),
    alamat: formData.get('alamat') as string,
    tanggal_mulai_huni: formData.get('tanggal_mulai_huni') as string,
    status: formData.get('status') as string || 'aktif',
  };

  // Check if No KK already exists
  const { data: existing } = await supabase
    .from('households')
    .select('id')
    .eq('no_kk', data.no_kk)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) {
    return { error: 'Nomor KK sudah terdaftar' };
  }

  // Insert household
  const { error } = await supabase
    .from('households')
    .insert(data);

  if (error) {
    console.error('Database error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/kk');
  redirect('/dashboard/kk');
}

/**
 * Update existing KK
 */
export async function updateKK(id: number, formData: FormData) {
  const supabase = await createClient();

  const data = {
    no_kk: formData.get('no_kk') as string,
    nama_kepala_keluarga: formData.get('nama_kepala_keluarga') as string,
    rt_id: parseInt(formData.get('rt_id') as string),
    alamat: formData.get('alamat') as string,
    tanggal_mulai_huni: formData.get('tanggal_mulai_huni') as string,
    status: formData.get('status') as string,
    updated_at: new Date().toISOString(),
  };

  // Check if No KK is taken by another household
  const { data: existing } = await supabase
    .from('households')
    .select('id')
    .eq('no_kk', data.no_kk)
    .neq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (existing) {
    return { error: 'Nomor KK sudah digunakan oleh KK lain' };
  }

  // Update household
  const { error } = await supabase
    .from('households')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Database error:', error);
    return { error: error.message };
  }

  // Update persons table with new no_kk if changed
  const oldNoKK = formData.get('old_no_kk') as string;
  if (oldNoKK && oldNoKK !== data.no_kk) {
    await supabase
      .from('persons')
      .update({ no_kk: data.no_kk })
      .eq('no_kk', oldNoKK)
      .is('deleted_at', null);
  }

  revalidatePath('/dashboard/kk');
  revalidatePath(`/dashboard/kk/${id}`);
  redirect('/dashboard/kk');
}

/**
 * Delete KK (soft delete)
 */
export async function deleteKK(id: number) {
  const supabase = await createClient();

  // Soft delete
  const { error } = await supabase
    .from('households')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Database error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/kk');
  return { success: true };
}

/**
 * Get KK with member count
 */
export async function getKKWithMembers(id: number) {
  const supabase = await createClient();

  // Get household details
  const { data: household, error: hhError } = await supabase
    .from('households')
    .select(`
      *,
      rts (
        id,
        kode,
        nama
      )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (hhError || !household) {
    return null;
  }

  // Get family members
  const { data: members } = await supabase
    .from('persons')
    .select('*')
    .eq('no_kk', household.no_kk)
    .is('deleted_at', null)
    .order('tanggal_lahir', { ascending: true });

  return {
    ...household,
    members: members || [],
  };
}
