'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          fontSize: '0.875rem',
        },
      }}
    />
  );
}
