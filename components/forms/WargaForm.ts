'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createWarga, updateWarga } from '@/app/actions/warga';

interface WargaFormProps {
  warga?: any;
  rtList: Array<{ id: number; kode: string; nama: string }>;
  mode: 'create' | 'edit';
}

export function WargaForm({ warga, rtList, mode }: WargaFormProps) {
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    warga?.extra_fields?.photo_url || null
  );

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (mode === 'create') {
        await createWarga(formData);
      } else {
        await updateWarga(warga.id, formData);
      }
    } catch (error) {
      console.error('Form error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo Upload */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto Warga</h3>
        <div className="flex items-center gap-6">
          {photoPreview && (
            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <Input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              label="Upload Foto"
              helperText="Format: JPG, PNG (Max 2MB)"
            />
          </div>
        </div>
      </div>

      {/* Data Identitas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Identitas</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="NIK *"
            name="nik"
            defaultValue={warga?.nik}
            required
            maxLength={16}
            pattern="[0-9]{16}"
            placeholder="3201011234567890"
            helperText="16 digit angka"
          />
          <Input
            label="Nama Lengkap *"
            name="nama"
            defaultValue={warga?.nama}
            required
            placeholder="Nama sesuai KTP"
          />
          <Input
            label="Tempat Lahir *"
            name="tempat_lahir"
            defaultValue={warga?.tempat_lahir}
            required
            placeholder="Kota kelahiran"
          />
          <Input
            label="Tanggal Lahir *"
            name="tanggal_lahir"
            type="date"
            defaultValue={warga?.tanggal_lahir}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Kelamin *
            </label>
            <select
              name="jenis_kelamin"
              defaultValue={warga?.jenis_kelamin || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Keluarga */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Keluarga</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Nomor KK *"
            name="no_kk"
            defaultValue={warga?.no_kk}
            required
            maxLength={16}
            pattern="[0-9]{16}"
            placeholder="3201011234567890"
            helperText="16 digit angka"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RT *
            </label>
            <select
              name="rt_id"
              defaultValue={warga?.rt_id || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih RT</option>
              {rtList.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.kode} - {rt.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Demografi */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Demografi</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agama *
            </label>
            <select
              name="agama"
              defaultValue={warga?.agama || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih</option>
              <option value="islam">Islam</option>
              <option value="kristen">Kristen</option>
              <option value="katolik">Katolik</option>
              <option value="hindu">Hindu</option>
              <option value="buddha">Buddha</option>
              <option value="konghucu">Konghucu</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Perkawinan *
            </label>
            <select
              name="status_perkawinan"
              defaultValue={warga?.status_perkawinan || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih</option>
              <option value="belum_kawin">Belum Kawin</option>
              <option value="kawin">Kawin</option>
              <option value="cerai_hidup">Cerai Hidup</option>
              <option value="cerai_mati">Cerai Mati</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pendidikan *
            </label>
            <select
              name="pendidikan"
              defaultValue={warga?.pendidikan || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih</option>
              <option value="tidak_sekolah">Tidak Sekolah</option>
              <option value="sd">SD</option>
              <option value="smp">SMP</option>
              <option value="sma">SMA</option>
              <option value="diploma">Diploma</option>
              <option value="s1">S1</option>
              <option value="s2">S2</option>
              <option value="s3">S3</option>
            </select>
          </div>
          <Input
            label="Pekerjaan *"
            name="pekerjaan"
            defaultValue={warga?.pekerjaan}
            required
            placeholder="Contoh: Pegawai Swasta, Wiraswasta, IRT"
          />
        </div>
      </div>

      {/* Data Kontak */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Kontak</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Lengkap *
            </label>
            <textarea
              name="alamat"
              defaultValue={warga?.alamat}
              required
              rows={3}
              placeholder="Alamat lengkap sesuai KTP"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Input
            label="No HP *"
            name="no_hp"
            type="tel"
            defaultValue={warga?.no_hp}
            required
            placeholder="08123456789"
            helperText="Format: 08xxxxxxxxxx"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            defaultValue={warga?.email}
            placeholder="email@example.com (opsional)"
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-between">
        
          href="/dashboard/warga"
          className="text-gray-600 hover:text-gray-800"
        >
          ← Kembali
        </a>
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah Warga' : 'Update Data'}
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center">
        * Field wajib diisi. Jika tidak ada data, isi dengan "N/A"
      </p>
    </form>
  );
}