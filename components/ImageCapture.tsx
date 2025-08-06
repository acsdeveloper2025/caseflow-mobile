import React, { useState, useRef } from 'react';
import { CapturedImage } from '../types';
import { CameraIcon } from './Icons';

interface ImageCaptureProps {
  images: CapturedImage[];
  onImagesChange: (images: CapturedImage[]) => void;
  isReadOnly?: boolean;
  minImages?: number;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ images, onImagesChange, isReadOnly, minImages }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTakePhoto = () => {
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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

  const handleFileCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please capture a valid image.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current position
      let latitude = 0;
      let longitude = 0;
      let accuracy;

      try {
        const position = await getCurrentPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        accuracy = position.coords.accuracy;
      } catch (geoError) {
        console.warn('Geolocation failed, proceeding without location:', geoError);
        // Continue without location data - don't block photo capture
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          setError('Failed to process captured image.');
          setIsLoading(false);
          return;
        }

        const timestamp = new Date().toISOString();
        const newImage: CapturedImage & { accuracy?: number } = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dataUrl,
          latitude,
          longitude,
          timestamp,
          accuracy: accuracy || undefined,
        };

        // Directly add to images array without preview
        onImagesChange([...images, newImage]);
        setIsLoading(false);
      };

      reader.onerror = () => {
        setError('Failed to process captured image.');
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to capture photo. Please try again.');
      console.error('Photo capture error:', err);
      setIsLoading(false);
    }

    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleDeleteImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
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
        <button
          onClick={handleTakePhoto}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold rounded-md bg-brand-primary hover:bg-brand-secondary text-white transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <CameraIcon width={16} height={16} />
          {isLoading ? 'Processing...' : 'Take Photo'}
        </button>
      </div>

      {/* Hidden file input for native camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileCapture}
        className="hidden"
      />

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




    </div>
  );
};

export default ImageCapture;
