type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export function showToast({ message, type = 'info', duration = 3000 }: ToastOptions) {
  const toast = document.createElement('div');

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  toast.className = `fixed bottom-20 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export const toast = {
  success: (message: string) => showToast({ message, type: 'success' }),
  error: (message: string) => showToast({ message, type: 'error' }),
  info: (message: string) => showToast({ message, type: 'info' }),
};
