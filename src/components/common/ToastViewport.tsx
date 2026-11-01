import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { PetToastDetail } from '../../utils/toast';

export const ToastViewport: React.FC = () => {
  const [items, setItems] = useState<PetToastDetail[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<PetToastDetail>).detail;
      if (!detail) return;
      setItems((current) => [...current.slice(-2), detail]);
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== detail.id));
      }, 4600);
    };
    window.addEventListener('petphet:toast', onToast);
    return () => window.removeEventListener('petphet:toast', onToast);
  }, []);

  if (!items.length) return null;

  return (
    <div className="pet-toast-viewport" aria-live="polite" aria-relevant="additions text">
      {items.map((item) => (
        <article key={item.id} className={`pet-toast-card ${item.type}`} role={item.type === 'error' ? 'alert' : 'status'}>
          <div className="pet-toast-copy">
            <strong>{item.type === 'success' ? 'Thành công rồi!' : 'Có lỗi xảy ra'}</strong>
            <p>{item.message}</p>
          </div>
          <button className="pet-toast-close" onClick={() => setItems((current) => current.filter((toast) => toast.id !== item.id))} aria-label="Đóng thông báo">
            <X size={16} />
          </button>
        </article>
      ))}
    </div>
  );
};
