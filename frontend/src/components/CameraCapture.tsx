import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const { t } = useTranslation('food');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError(t('camera.permissionDenied'));
        } else if (err.name === 'NotFoundError') {
          setError(t('camera.notFound'));
        } else {
          setError(t('camera.error'));
        }
      }
    }
  }, [facingMode, stream, t]);

  const checkMultipleCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    } catch {
      setHasMultipleCameras(false);
    }
  }, []);

  useEffect(() => {
    checkMultipleCameras();
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          onCapture(file);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const buttonTouchStyles = {
    WebkitTapHighlightColor: 'transparent',
  } as React.CSSProperties;

  const cameraContent = (
    <div className="camera-overlay fixed inset-0 z-[9999] bg-black">
      <div className="absolute inset-0">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
            <div>
              <svg
                className="w-16 h-16 mx-auto mb-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-lg">{error}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'translateZ(0)' }}
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div
        className="absolute left-0 right-0 bg-black/80 px-4 py-6"
        style={{ bottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 10px), 10px)' }}
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            type="button"
            onClick={onCancel}
            className="w-14 h-14 flex items-center justify-center text-white active:bg-white/20 rounded-full transition-colors touch-manipulation select-none"
            style={buttonTouchStyles}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleCapture}
            disabled={!!error}
            className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform touch-manipulation select-none"
            style={buttonTouchStyles}
          />

          {hasMultipleCameras ? (
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="w-14 h-14 flex items-center justify-center text-white active:bg-white/20 rounded-full transition-colors touch-manipulation select-none"
              style={buttonTouchStyles}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          ) : (
            <div className="w-14 h-14" />
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(cameraContent, document.body);
}
