import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils/cn';
import Button from './Button';
import CameraCapture from './CameraCapture';

interface PhotoUploadProps {
  onPhotoSelect: (file: File) => void;
  previewUrl?: string | null;
  loading?: boolean;
  className?: string;
}

const hasCameraSupport = () => {
  return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
};

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export default function PhotoUpload({
  onPhotoSelect,
  previewUrl,
  loading = false,
  className,
}: PhotoUploadProps) {
  const { t } = useTranslation('food');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const canUseMediaDevices = hasCameraSupport();
  const isMobile = isMobileDevice();

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      onPhotoSelect(file);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    onPhotoSelect(file);
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
        />
      )}

      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt={t('photo.preview')}
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            {hasCameraSupport() && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCamera(true)}
                disabled={loading}
              >
                {t('camera.takePhoto')}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {t('camera.chooseFile')}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300',
            loading && 'opacity-50 pointer-events-none'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 mb-3">{t('photo.dragAndDrop')}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {hasCameraSupport() && (
                  <Button onClick={() => setShowCamera(true)} disabled={loading}>
                    {t('camera.takePhoto')}
                  </Button>
                )}
                <Button
                  variant={hasCameraSupport() ? 'secondary' : 'primary'}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {t('camera.chooseFile')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
