import React, { useState, useRef, useEffect } from 'react';
import { CapturedImage } from '../types';
import { CameraIcon, MapPinIcon, ClockIcon, XIcon } from './Icons';
import Spinner from './Spinner';
import Modal from './Modal';

interface ImageCaptureProps {
  images: CapturedImage[];
  onImagesChange: (images: CapturedImage[]) => void;
  isReadOnly: boolean;
  minImages: number;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ images, onImagesChange, isReadOnly, minImages }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };
  
  useEffect(() => {
    // Cleanup function to stop camera when component unmounts or modal closes
    return () => {
      stopCamera();
    };
  }, []);

  const handleStartCapture = async () => {
    setError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCapturing(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions and try again.");
      }
    } else {
      setError("Camera not supported on this device.");
    }
  };

  const handleTakePhoto = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      const timestamp = new Date().toISOString();

      const video = videoRef.current;
      if (!video) throw new Error("Video element not found.");

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error("Could not get canvas context.");
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      const newImage: CapturedImage = {
        id: `img_${Date.now()}`,
        dataUrl,
        latitude,
        longitude,
        timestamp,
      };
      
      onImagesChange([...images, newImage]);
      stopCamera();

    } catch (err) {
      console.error("Failed to capture image or location:", err);
      let errorMessage = "An unexpected error occurred.";
      if (err instanceof GeolocationPositionError) {
        errorMessage = `Could not get location: ${err.message}. Please ensure location services are enabled and permissions are granted.`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteImage = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  return (
    <div className="my-4 p-4 bg-dark-card/50 rounded-lg border border-dark-border">
      <h5 className="font-semibold text-light-text mb-2">Geotagged Photos</h5>
      <p className="text-sm text-medium-text mb-3">
        A minimum of {minImages} geotagged photos are required for submission. Captured: {images.length}/{minImages}
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {images.map(image => (
            <div key={image.id} className="bg-dark-card rounded-lg overflow-hidden border border-dark-border relative">
              <img src={image.dataUrl} alt="Captured" className="w-full h-auto" />
              <div className="p-3">
                <div className="flex items-center text-xs text-medium-text mb-2">
                  <ClockIcon width={12} height={12} color='currentColor' />
                  <span className="ml-1.5">{new Date(image.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center text-xs text-medium-text mb-3">
                  <MapPinIcon width={12} height={12} color='currentColor' />
                  <span className="ml-1.5">{image.latitude.toFixed(5)}, {image.longitude.toFixed(5)}</span>
                </div>
                <div className="w-full h-24 bg-gray-700 flex items-center justify-center text-xs text-medium-text rounded">Map preview disabled.</div>
              </div>
              {!isReadOnly && (
                <button 
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500/80"
                  aria-label="Delete image"
                >
                  <XIcon width={16} height={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isReadOnly && (
        <button
          onClick={handleStartCapture}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-md bg-brand-primary hover:bg-brand-secondary text-white transition-colors"
        >
          <CameraIcon width={20} height={20} />
          Add Geotagged Photo
        </button>
      )}

      {error && <p className="text-sm text-red-400 mt-2 text-center">{error}</p>}
      
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
    </div>
  );
};

export default ImageCapture;