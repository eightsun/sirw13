// Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'warga' | 'koordinator_rw' | 'ketua_rt' | 'ketua_rw';

export type StatusHuni = 'berpenghuni' | 'tidak_berpenghuni';
export type StatusKepemilikan = 'milik_sendiri' | 'sewa';
export type JenisKelamin = 'L' | 'P';
export type StatusPerkawinan = 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';

// Database Tables
export interface RT {
  id: number;
  kode: string;
  nama: string;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: number;
  nama: string;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
}

export interface Street {
  id: number;
  area_id: number;
  nama: string;
  kode: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  area?: Area;
}

export interface House {
  id: number;
  area_id: number;
  street_id: number;
  rt_id: number;
  house_number: string;
  status_huni: StatusHuni;
  status_kepemilikan: StatusKepemilikan;
  alamat_lengkap: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  // Relations
  area?: Area;
  street?: Street;
  rt?: RT;
  households?: Household[];
}

export interface Household {
  id: number;
  no_kk: string;
  house_id: number | null;
  nama_kepala_keluarga: string;
  tanggal_mulai_huni: string | null;
  tanggal_selesai_huni: string | null;
  status: 'aktif' | 'pindah' | 'nonaktif';
  catatan: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  // Relations
  house?: House;
  persons?: Person[];
}

export interface Person {
  id: number;
  household_id: number | null;
  user_id: string | null;
  nik: string;
  no_kk: string;
  nama: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: JenisKelamin | null;
  agama: string | null;
  status_perkawinan: StatusPerkawinan | null;
  pendidikan: string | null;
  pekerjaan: string | null;
  kewarganegaraan: string | null;
  golongan_darah: string | null;
  alamat: string | null;
  rt_id: number | null;
  no_hp: string | null;
  whatsapp: string | null;
  email: string | null;
  tanggal_mulai_menetap: string | null;
  status_tinggal: string | null;
  hubungan_keluarga: string | null;
  extra_fields: Json | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  // Relations
  household?: Household;
  rt?: RT;
}

export interface UserRoleRecord {
  id: number;
  user_id: string;
  role: UserRole;
  rt_id: number | null;
  created_at: string;
  updated_at: string;
  // Relations
  rt?: RT;
}

export interface ChangeRequest {
  id: number;
  person_id: number | null;
  household_id: number | null;
  request_type: string;
  current_data: Json | null;
  proposed_data: Json | null;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  person?: Person;
  household?: Household;
}

export interface AuditLog {
  id: number;
  table_name: string;
  record_id: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Json | null;
  new_data: Json | null;
  changed_by: string | null;
  changed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

// Views
export interface WargaLengkap {
  id: number;
  nik: string;
  no_kk: string;
  nama: string;
  jenis_kelamin: JenisKelamin | null;
  tanggal_lahir: string | null;
  agama: string | null;
  pekerjaan: string | null;
  no_hp: string | null;
  whatsapp: string | null;
  email: string | null;
  alamat: string | null;
  rt_kode: string | null;
  rt_nama: string | null;
  household_no_kk: string | null;
  nama_kepala_keluarga: string | null;
  household_status: string | null;
  house_number: string | null;
  status_huni: StatusHuni | null;
  status_kepemilikan: StatusKepemilikan | null;
  nama_jalan: string | null;
  nama_area: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RumahLengkap {
  id: number;
  house_number: string;
  status_huni: StatusHuni;
  status_kepemilikan: StatusKepemilikan;
  alamat_lengkap: string | null;
  nama_jalan: string;
  nama_area: string;
  rt_kode: string;
  rt_nama: string;
  no_kk: string | null;
  nama_kepala_keluarga: string | null;
  status_kk: string | null;
  jumlah_penghuni: number;
  created_at: string;
  updated_at: string;
}

// Auth User Extended
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole | null;
  rt_id: number | null;
  person?: Person;
  user_roles?: UserRoleRecord[];
}

// Form Types
export interface PersonFormData {
  household_id?: number;
  nik: string;
  no_kk: string;
  nama: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: JenisKelamin;
  agama?: string;
  status_perkawinan?: StatusPerkawinan;
  pendidikan?: string;
  pekerjaan?: string;
  kewarganegaraan?: string;
  golongan_darah?: string;
  no_hp?: string;
  whatsapp?: string;
  email?: string;
  tanggal_mulai_menetap?: string;
  hubungan_keluarga?: string;
}

export interface HouseholdFormData {
  no_kk: string;
  house_id?: number;
  nama_kepala_keluarga: string;
  tanggal_mulai_huni?: string;
  tanggal_selesai_huni?: string;
  status?: 'aktif' | 'pindah' | 'nonaktif';
  catatan?: string;
}

export interface HouseFormData {
  area_id: number;
  street_id: number;
  rt_id: number;
  house_number: string;
  status_huni: StatusHuni;
  status_kepemilikan: StatusKepemilikan;
  catatan?: string;
}

// Search & Filter Types
export interface SearchParams {
  query?: string;
  rt_id?: number;
  area_id?: number;
  street_id?: number;
  status_huni?: StatusHuni;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  total_warga: number;
  total_kk: number;
  total_rumah: number;
  rumah_berpenghuni: number;
  rumah_kosong: number;
  by_rt?: RTStats[];
}

export interface RTStats {
  rt_id: number;
  rt_kode: string;
  total_warga: number;
  total_kk: number;
  total_rumah: number;
}
