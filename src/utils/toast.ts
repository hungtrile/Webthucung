export type PetToastType = 'success' | 'error';

export interface PetToastDetail {
  id: string;
  type: PetToastType;
  message: string;
}

/** Dispatch a branded Pet Phết toast to the global application viewport. */
export function notifyToast(type: PetToastType, message: string) {
  if (typeof window === 'undefined' || !message.trim()) return;
  const detail: PetToastDetail = {
    id: `pet-toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    message: message.trim()
  };
  window.dispatchEvent(new CustomEvent<PetToastDetail>('petphet:toast', { detail }));
}
