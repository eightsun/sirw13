'use client';

import { useState } from 'react';
import { deleteWarga } from '@/app/actions/warga';

interface DeleteButtonProps {
  wargaId: number;
  wargaNama: string;
}

export function DeleteButton({ wargaId, wargaNama }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteWarga(wargaId);
      if (result.success) {
        window.location.reload();
      } else {
        alert('Gagal menghapus data: ' + result.error);
        setLoading(false);
      }
    } catch (error) {
      alert('Terjadi kesalahan');
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Konfirmasi Hapus
          </h3>
          <p className="text-gray-600 mb-6">
            Apakah Anda yakin ingin menghapus data warga <strong>{wargaNama}</strong>?
            <br />
            <span className="text-sm text-gray-500">
              Data akan di-soft delete dan bisa dipulihkan kembali.
            </span>
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-800 font-medium"
    >
      Hapus
    </button>
  );

}
