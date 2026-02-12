'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createUserWarga } from '@/lib/profile-helpers';

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nama = formData.get('nama') as string;

  // Register user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama: nama,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create basic warga record
  if (data.user) {
    await createUserWarga(email, nama);
  }

  // Redirect to check email page
  redirect('/auth/check-email');
}
