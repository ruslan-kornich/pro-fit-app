import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function wasDismissedRecently(): boolean {
  const timestamp = localStorage.getItem(DISMISSED_KEY);
  if (!timestamp) return false;
  return Date.now() - Number(timestamp) < DISMISS_DURATION_MS;
}

function isIosSafari(): boolean {
  const userAgent = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/crios|fxios|opios/i.test(userAgent);
  return isIos && isSafari;
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);
}

export default function InstallPrompt() {
  const { t } = useTranslation('common');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (isIosSafari()) {
      setShowIosPrompt(true);
      setVisible(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
    setDeferredPrompt(null);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 animate-slide-up">
      <div className="max-w-lg mx-auto bg-white rounded-card shadow-lg border border-gray-100 p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">
            {t('pwa.title')}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {showIosPrompt ? t('pwa.iosHint') : t('pwa.description')}
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {!showIosPrompt && (
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 text-sm font-medium text-white rounded-xl gradient-primary"
            >
              {t('pwa.install')}
            </button>
          )}
          <button
            onClick={dismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
