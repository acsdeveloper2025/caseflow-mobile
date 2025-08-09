import React, { useState, useRef, useEffect } from 'react';
import { CapturedImage } from '../types';
import { CameraIcon, MapPinIcon, ClockIcon } from './Icons';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { requestCameraPermissions, requestLocationPermissions, showPermissionDeniedAlert } from '../utils/permissions';

interface ImageCaptureProps {
  images: CapturedImage[];
  onImagesChange: (images: CapturedImage[]) => void;
  isReadOnly?: boolean;
  minImages?: number;
  cameraDirection?: 'front' | 'rear';
  componentType?: 'photo' | 'selfie';
  title?: string;
  required?: boolean;
}

interface ImageMetadata {
  address?: string;
  isLoadingAddress?: boolean;
  addressError?: string;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({
  images,
  onImagesChange,
  isReadOnly,
  minImages,
  cameraDirection = 'rear',
  componentType = 'photo',
  title,
  required = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<Record<string, ImageMetadata>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTakePhoto = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Request camera permissions first
      const cameraPermission = await requestCameraPermissions();

      if (!cameraPermission.granted) {
        if (cameraPermission.denied) {
          showPermissionDeniedAlert('Camera');
        }
        setError('Camera permission is required to take photos');
        setIsLoading(false);
        return;
      }

      // Use native camera if available, fallback to web
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: cameraDirection === 'front' ? CameraDirection.Front : CameraDirection.Rear,
      });

      if (image.dataUrl) {
        await processImage(image.dataUrl);
      } else {
        throw new Error('Failed to capture image');
      }
    } catch (error) {
      console.warn('Native camera failed, falling back to web camera:', error);
      // Fallback to web camera
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const processImage = async (dataUrl: string) => {
    try {
      // Get current position using Capacitor Geolocation
      let latitude = 0;
      let longitude = 0;
      let accuracy;

      try {
        // Request location permissions first
        const locationPermission = await requestLocationPermissions();

        if (locationPermission.granted) {
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          accuracy = position.coords.accuracy;
        } else {
          console.warn('Location permission not granted, proceeding without location');
        }
      } catch (geoError) {
        console.warn('Geolocation failed, proceeding without location:', geoError);
        // Continue without location data - don't block photo capture
      }

      const timestamp = new Date().toISOString();
      const newImage: CapturedImage & { accuracy?: number } = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dataUrl,
        latitude,
        longitude,
        timestamp,
        componentType: componentType || 'photo', // Add componentType metadata for auto-save
        accuracy: accuracy || undefined,
      };

      // Directly add to images array
      onImagesChange([...images, newImage]);

      // Fetch address for the new image if location is available
      if (latitude !== 0 && longitude !== 0) {
        fetchAddressForImage(newImage.id, latitude, longitude);
      }
    } catch (err) {
      setError('Failed to process captured image. Please try again.');
      console.error('Image processing error:', err);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CaseFlow-Mobile-App'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();

      if (data && data.display_name) {
        return data.display_name;
      } else {
        throw new Error('Address not found');
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      throw error;
    }
  };

  const fetchAddressForImage = async (imageId: string, latitude: number, longitude: number) => {
    if (latitude === 0 && longitude === 0) return;

    setImageMetadata(prev => ({
      ...prev,
      [imageId]: { ...prev[imageId], isLoadingAddress: true }
    }));

    try {
      const address = await reverseGeocode(latitude, longitude);
      setImageMetadata(prev => ({
        ...prev,
        [imageId]: { ...prev[imageId], address, isLoadingAddress: false }
      }));
    } catch (error) {
      setImageMetadata(prev => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          addressError: 'Address unavailable',
          isLoadingAddress: false
        }
      }));
    }
  };

  // Fetch addresses for images when component loads or images change
  useEffect(() => {
    images.forEach(image => {
      if (image.latitude !== 0 && image.longitude !== 0 && !imageMetadata[image.id]) {
        fetchAddressForImage(image.id, image.latitude, image.longitude);
      }
    });
  }, [images]);

  const getCurrentPosition = async (): Promise<GeolocationPosition> => {
    try {
      // Try Capacitor Geolocation first
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      // Convert Capacitor position to standard GeolocationPosition format
      return {
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        },
        timestamp: position.timestamp,
      } as GeolocationPosition;
    } catch (error) {
      // Fallback to web geolocation
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
    }
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
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          setError('Failed to process captured image.');
          setIsLoading(false);
          return;
        }

        await processImage(dataUrl);
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
    // Clean up metadata for deleted image
    setImageMetadata(prev => {
      const newMetadata = { ...prev };
      delete newMetadata[id];
      return newMetadata;
    });
  };

  const formatCoordinates = (lat: number, lng: number): string => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const formatDateTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const generateMapUrl = (lat: number, lng: number): string => {
    // Using OpenStreetMap-based map embed
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.001},${lat-0.001},${lng+0.001},${lat+0.001}&layer=mapnik&marker=${lat},${lng}`;
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
        <h6 className="font-semibold text-light-text">
          {title || (componentType === 'selfie' ? '🤳 Selfie Photo Capture' : '📷 Photo Capture')}
          {required && <span className="text-red-400 ml-1">*</span>}
        </h6>
        <button
          onClick={handleTakePhoto}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold rounded-md bg-brand-primary hover:bg-brand-secondary text-white transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {componentType === 'selfie' ? (
            <span className="w-4 h-4">🤳</span>
          ) : (
            <CameraIcon width={16} height={16} />
          )}
          {isLoading ? 'Processing...' : (componentType === 'selfie' ? 'Take Selfie' : 'Take Photo')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image) => {
            const metadata = imageMetadata[image.id] || {};
            const hasLocation = image.latitude !== 0 && image.longitude !== 0;

            return (
              <div key={image.id} className="bg-gray-900/50 rounded-lg border border-dark-border overflow-hidden">
                {/* Image Container */}
                <div className="relative group">
                  <img src={image.dataUrl} alt="Captured" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>

                {/* Metadata Panel */}
                <div className="p-4 space-y-3">
                  {/* Date and Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon width={16} height={16} className="text-brand-primary" />
                    <span className="text-light-text font-medium">
                      {formatDateTime(image.timestamp)}
                    </span>
                  </div>

                  {/* GPS Coordinates */}
                  {hasLocation ? (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPinIcon width={16} height={16} className="text-brand-primary" />
                      <span className="text-medium-text">
                        {formatCoordinates(image.latitude, image.longitude)}
                      </span>
                      {(image as any).accuracy && (
                        <span className="text-xs text-gray-400">
                          (±{Math.round((image as any).accuracy)}m)
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPinIcon width={16} height={16} className="text-gray-500" />
                      <span className="text-gray-500">Location not available</span>
                    </div>
                  )}

                  {/* Address */}
                  {hasLocation && (
                    <div className="text-sm">
                      <div className="text-medium-text font-medium mb-1">Address:</div>
                      {metadata.isLoadingAddress ? (
                        <div className="text-gray-400 italic">Loading address...</div>
                      ) : metadata.address ? (
                        <div className="text-light-text text-xs leading-relaxed">
                          {metadata.address}
                        </div>
                      ) : metadata.addressError ? (
                        <div className="text-gray-500 text-xs">{metadata.addressError}</div>
                      ) : (
                        <div className="text-gray-500 text-xs">Address not available</div>
                      )}
                    </div>
                  )}

                  {/* Interactive Map */}
                  {hasLocation && (
                    <div className="space-y-2">
                      <div className="text-medium-text font-medium text-sm">Location Map:</div>
                      <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ height: '120px' }}>
                        <iframe
                          src={generateMapUrl(image.latitude, image.longitude)}
                          width="100%"
                          height="120"
                          style={{ border: 0 }}
                          loading="lazy"
                          title={`Map for image ${image.id}`}
                          className="rounded-lg"
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          📍 Photo Location
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
