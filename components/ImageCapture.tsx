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
  const [showFallback, setShowFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setError(null);

      // Check if we're on HTTPS or localhost (required for camera access)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        throw new Error('Camera access requires HTTPS connection');
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this device');
      }

      // Enhanced constraints for better Android compatibility
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: { ideal: 16/9 }
        },
        audio: false
      };

      // Try with enhanced constraints first
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (enhancedError) {
        console.warn('Enhanced constraints failed, trying basic constraints:', enhancedError);
        // Fallback to basic constraints for older Android devices
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Ensure video plays on Android
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(playError => {
              console.warn('Video play failed:', playError);
            });
          }
        };
      }
    } catch (err) {
      let errorMessage = 'Unable to access camera. ';

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage += 'Camera is not supported on this device.';
        } else if (err.name === 'NotReadableError') {
          errorMessage += 'Camera is already in use by another application.';
        } else {
          errorMessage += err.message;
        }
      } else {
        errorMessage += 'Please check permissions and try again.';
      }

      setError(errorMessage);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please select a file smaller than 10MB.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) throw new Error('Failed to read image file');

        // Get current position for uploaded image
        let latitude = 0;
        let longitude = 0;
        let accuracy;

        try {
          const position = await getCurrentPosition();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          accuracy = position.coords.accuracy;
        } catch (geoError) {
          console.warn('Geolocation failed for uploaded image:', geoError);
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

        setPreviewImage(newImage);
        setIsPreviewOpen(true);
      } catch (err) {
        setError('Failed to process image file. Please try again.');
        console.error('File upload error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read image file. Please try again.');
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleUseFallback = () => {
    setShowFallback(true);
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

      // Enhanced geolocation options for better Android compatibility
      const options = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for Android devices
        maximumAge: 30000 // Reduced max age for more accurate location
      };

      // Try high accuracy first
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          console.warn('High accuracy geolocation failed, trying standard accuracy:', error);
          // Fallback to standard accuracy for Android devices with GPS issues
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        },
        options
      );
    });
  };

  const handleTakePhoto = async () => {
    if (!videoRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get current position with fallback
      let position;
      let latitude = 0;
      let longitude = 0;
      let accuracy;

      try {
        position = await getCurrentPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        accuracy = position.coords.accuracy;
      } catch (geoError) {
        console.warn('Geolocation failed, proceeding without location:', geoError);
        // Continue without location data - don't block photo capture
      }

      const timestamp = new Date().toISOString();

      // Ensure video is ready for capture
      if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        throw new Error('Camera is not ready. Please wait and try again.');
      }

      // Capture photo with enhanced canvas handling for Android
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');

      // Get actual video dimensions
      const videoWidth = videoRef.current.videoWidth || videoRef.current.clientWidth;
      const videoHeight = videoRef.current.videoHeight || videoRef.current.clientHeight;

      if (videoWidth === 0 || videoHeight === 0) {
        throw new Error('Invalid video dimensions. Please restart the camera.');
      }

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw image with better quality settings for Android
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

      // Convert to JPEG with optimized quality for mobile
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Validate the captured image
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('Failed to capture image. Please try again.');
      }

      const newImage: CapturedImage & { accuracy?: number } = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      let errorMessage = 'Failed to capture photo. ';

      if (err instanceof Error) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again.';
      }

      setError(errorMessage);
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
          <div className="flex gap-2">
            <button
              onClick={handleStartCapture}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-brand-primary hover:bg-brand-secondary text-white transition-colors flex items-center gap-2"
            >
              <CameraIcon width={16} height={16} />
              Take Photo
            </button>
            <button
              onClick={handleUseFallback}
              className="px-3 py-2 text-sm font-semibold rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors"
              title="Upload from gallery"
            >
              📁
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input for fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <div className="flex flex-col gap-2">
            <span>{error}</span>
            {error.includes('camera') && !showFallback && (
              <button
                onClick={handleUseFallback}
                className="text-yellow-400 hover:text-yellow-300 text-sm underline self-start"
              >
                Try uploading from gallery instead
              </button>
            )}
          </div>
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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            controls={false}
            className="w-full h-auto rounded-lg bg-black"
            style={{ objectFit: 'cover', minHeight: '300px' }}
            onLoadedMetadata={() => {
              // Ensure video plays on Android devices
              if (videoRef.current) {
                videoRef.current.play().catch(console.warn);
              }
            }}
          />
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
