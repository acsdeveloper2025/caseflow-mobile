import React, { useState, useRef } from 'react';
import { CapturedImage } from '../types';
import { CameraIcon, MapPinIcon, ClockIcon } from './Icons';
import Spinner from './Spinner';
import Modal from './Modal';

interface ImageCaptureProps {
  images: CapturedImage[];
  onImagesChange: (images: CapturedImage[]) => void;
  isReadOnly?: boolean;
  minImages?: number;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ images, onImagesChange, isReadOnly, minImages }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<CapturedImage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const handleStartCapture = () => {
    setIsCapturing(true);
    startCamera();
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  };

  const handleTakePhoto = async () => {
    if (!videoRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get current position
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;
      const timestamp = new Date().toISOString();

      // Capture photo
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      const newImage: CapturedImage & { accuracy?: number } = {
        id: `img_${Date.now()}`,
        dataUrl,
        latitude,
        longitude,
        timestamp,
        accuracy: accuracy || undefined,
      };

      // Show preview instead of immediately saving
      setPreviewImage(newImage);
      setIsPreviewOpen(true);
      stopCamera();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture photo');
      console.error('Photo capture error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  const handleKeepPhoto = () => {
    if (previewImage) {
      onImagesChange([...images, previewImage]);
      setPreviewImage(null);
      setIsPreviewOpen(false);
    }
  };

  const handleRetakePhoto = () => {
    setPreviewImage(null);
    setIsPreviewOpen(false);
    // Restart camera for retake
    handleStartCapture();
  };

  const handleCancelPreview = () => {
    setPreviewImage(null);
    setIsPreviewOpen(false);
  };

  const getImageQualityInfo = (dataUrl: string) => {
    const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
    const sizeInKB = Math.round(sizeInBytes / 1024);
    const sizeInMB = (sizeInKB / 1024).toFixed(1);
    
    let quality = 'Good';
    let qualityColor = 'text-green-400';
    
    if (sizeInKB < 100) {
      quality = 'Low';
      qualityColor = 'text-red-400';
    } else if (sizeInKB < 500) {
      quality = 'Medium';
      qualityColor = 'text-yellow-400';
    } else {
      quality = 'High';
      qualityColor = 'text-green-400';
    }
    
    return {
      size: sizeInKB > 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`,
      quality,
      qualityColor
    };
  };

  if (isReadOnly) {
    return (
      <div className="space-y-4">
        <h6 className="font-semibold text-light-text">📷 Captured Images</h6>
        {images.length === 0 ? (
          <p className="text-medium-text text-sm">No images captured</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative">
                <img src={image.dataUrl} alt="Captured" className="w-full h-32 object-cover rounded-lg" />
                <div className="absolute bottom-2 left-2 text-xs text-white bg-black/70 px-2 py-1 rounded">
                  {new Date(image.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h6 className="font-semibold text-light-text">📷 Photo Capture</h6>
        {!isCapturing && (
          <button
            onClick={handleStartCapture}
            className="px-4 py-2 text-sm font-semibold rounded-md bg-brand-primary hover:bg-brand-secondary text-white transition-colors flex items-center gap-2"
          >
            <CameraIcon width={16} height={16} />
            Take Photo
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img src={image.dataUrl} alt="Captured" className="w-full h-32 object-cover rounded-lg" />
              <div className="absolute bottom-2 left-2 text-xs text-white bg-black/70 px-2 py-1 rounded">
                {new Date(image.timestamp).toLocaleTimeString()}
              </div>
              <button
                onClick={() => handleDeleteImage(image.id)}
                className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {minImages && images.length < minImages && (
        <p className="text-yellow-400 text-sm">
          Please capture at least {minImages} image{minImages > 1 ? 's' : ''}.
        </p>
      )}

      <Modal isVisible={isCapturing} onClose={stopCamera} title="Capture Photo">
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg bg-black" />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
            <button
              onClick={handleTakePhoto}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-white/90 hover:bg-white border-4 border-white/30 flex items-center justify-center disabled:opacity-50"
              aria-label="Take Photo"
            >
              {isLoading ? <Spinner size="small" /> : <div className="w-12 h-12 rounded-full bg-white ring-2 ring-inset ring-gray-600" />}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isVisible={isPreviewOpen} onClose={handleCancelPreview} title="Photo Preview">
        {previewImage && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <img 
                src={previewImage.dataUrl} 
                alt="Captured Preview" 
                className="w-full h-auto max-h-[60vh] object-contain"
                style={{ minHeight: '200px' }}
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                <span className={getImageQualityInfo(previewImage.dataUrl).qualityColor}>
                  {getImageQualityInfo(previewImage.dataUrl).quality} Quality
                </span>
                <span className="ml-2 text-gray-300">
                  ({getImageQualityInfo(previewImage.dataUrl).size})
                </span>
              </div>
            </div>

            <div className="bg-dark-card/50 rounded-lg p-4 border border-dark-border">
              <h6 className="font-semibold text-light-text mb-3 text-sm">📍 Location & Time Information</h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start text-medium-text">
                  <ClockIcon width={14} height={14} color='currentColor' className="mt-0.5" />
                  <span className="ml-2">
                    <strong>Captured:</strong><br/>
                    {new Date(previewImage.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-start text-medium-text">
                  <MapPinIcon width={14} height={14} color='currentColor' className="mt-0.5" />
                  <span className="ml-2">
                    <strong>Coordinates:</strong><br/>
                    {previewImage.latitude.toFixed(6)}, {previewImage.longitude.toFixed(6)}
                  </span>
                </div>
                {(previewImage as any).accuracy && (
                  <div className="flex items-start text-medium-text">
                    <div className="w-3.5 h-3.5 mt-0.5 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span className="ml-2">
                      <strong>GPS Accuracy:</strong><br/>
                      ±{Math.round((previewImage as any).accuracy)} meters
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleRetakePhoto}
                className="flex-1 px-4 py-3 text-sm font-semibold rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors flex items-center justify-center gap-2"
              >
                <CameraIcon width={16} height={16} />
                Retake Photo
              </button>
              <button
                onClick={handleCancelPreview}
                className="flex-1 px-4 py-3 text-sm font-semibold rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleKeepPhoto}
                className="flex-1 px-4 py-3 text-sm font-semibold rounded-md bg-brand-primary hover:bg-brand-secondary text-white transition-colors flex items-center justify-center gap-2"
              >
                ✓ Keep Photo
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ImageCapture;
