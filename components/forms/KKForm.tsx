'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createKK, updateKK } from '@/app/actions/kk';

interface KKFormProps {
  kk?: any;
  rtList: Array<{ id: number; kode: string; nama: string }>;
  mode: 'create' | 'edit';
}

export function KKForm({ kk, rtList, mode }: KKFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      let result;
      if (mode === 'create') {
        result = await createKK(formData);
      } else {
        // Add old_no_kk for update checking
        if (kk?.no_kk) {
          formData.append('old_no_kk', kk.no_kk);
        }
        result = await updateKK(kk.id, formData);
      }

      if (result && result.error) {
        alert('Error: ' + result.error);
        setLoading(false);
        return;
      }

      // Success - redirect handled by server action
    } catch (error: any) {
      console.error('Exception during submit:', error);
      alert('Terjadi kesalahan: ' + (error.message || error.toString()));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Kartu Keluarga</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Nomor KK *"
            name="no_kk"
            defaultValue={kk?.no_kk}
            required
            maxLength={16}
            pattern="[0-9]{16}"
            placeholder="3201011234567890"
            helperText="16 digit angka"
          />
          <Input
            label="Nama Kepala Keluarga *"
            name="nama_kepala_keluarga"
            defaultValue={kk?.nama_kepala_keluarga}
            required
            placeholder="Nama lengkap kepala keluarga"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RT *
            </label>
            <select
              name="rt_id"
              defaultValue={kk?.rt_id || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Pilih RT</option>
              {rtList.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.kode} - {rt.nama}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Tanggal Mulai Menghuni *"
            name="tanggal_mulai_huni"
            type="date"
            defaultValue={kk?.tanggal_mulai_huni}
            required
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alamat</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Lengkap *
            </label>
            <textarea
              name="alamat"
              defaultValue={kk?.alamat}
              required
              rows={3}
              placeholder="Alamat lengkap sesuai KK"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              name="status"
              defaultValue={kk?.status || 'aktif'}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="aktif">Aktif</option>
              <option value="pindah">Pindah</option>
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <a
          href="/dashboard/kk"
          className="text-gray-600 hover:text-gray-800"
        >
          ← Kembali
        </a>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah KK' : 'Update Data'}
        </Button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        * Field wajib diisi
      </p>
    </form>
  );
}
