'use client';

import { deleteKK } from '@/app/actions/kk';
import { useState } from 'react';

export function DeleteKKButton({ kkId, kkName }: { kkId: number; kkName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus KK: ${kkName}?`)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const result = await deleteKK(kkId);
      
      if (result && result.error) {
        alert('Error: ' + result.error);
        setIsDeleting(false);
      }
      // Success - page will revalidate automatically
    } catch (error: any) {
      alert('Terjadi kesalahan: ' + error.message);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? 'Menghapus...' : 'Hapus'}
    </button>
  );
}
