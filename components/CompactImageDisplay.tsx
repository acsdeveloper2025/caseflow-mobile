import React, { useState, useEffect } from 'react';
import { CapturedImage } from '../types';
import { CameraIcon } from './Icons';
import ImageModal from './ImageModal';
import { AddressComponents } from '../services/googleMapsService';

interface CompactImageDisplayProps {
  images: CapturedImage[];
  onImagesChange: (images: CapturedImage[]) => void;
  onTakePhoto: () => void;
  isLoading: boolean;
  error: string | null;
  title: string;
  componentType: 'photo' | 'selfie';
  required: boolean;
  isReadOnly?: boolean;
  imageMetadata?: Record<string, {
    address?: string;
    enhancedAddress?: AddressComponents;
    validationResult?: any;
    isLoadingAddress?: boolean;
    addressError?: string;
  }>;
}

const CompactImageDisplay: React.FC<CompactImageDisplayProps> = ({
  images,
  onImagesChange,
  onTakePhoto,
  isLoading,
  error,
  title,
  componentType,
  required,
  isReadOnly = false,
  imageMetadata = {}
}) => {
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if we're on a mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };

    checkMobile();
  }, []);

  const handleDeleteImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const handleImageClick = (image: CapturedImage) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Platform-specific thumbnail size
  const thumbnailSize = isMobile ? 56 : 64;

  // Create inline styles for better platform compatibility
  const thumbnailContainerStyle: React.CSSProperties = {
    width: `${thumbnailSize}px`,
    height: `${thumbnailSize}px`,
    minWidth: `${thumbnailSize}px`,
    minHeight: `${thumbnailSize}px`,
    maxWidth: `${thumbnailSize}px`,
    maxHeight: `${thumbnailSize}px`,
    flexShrink: 0,
    display: 'block',
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #4B5563',
    cursor: 'pointer'
  };

  const thumbnailImageStyle: React.CSSProperties = {
    width: `${thumbnailSize}px`,
    height: `${thumbnailSize}px`,
    minWidth: `${thumbnailSize}px`,
    minHeight: `${thumbnailSize}px`,
    maxWidth: `${thumbnailSize}px`,
    maxHeight: `${thumbnailSize}px`,
    objectFit: 'cover',
    display: 'block',
    border: 'none',
    outline: 'none',
    margin: 0,
    padding: 0
  };

  return (
    <>
      <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-3" style={{ minHeight: 'auto', maxHeight: '200px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-light-text">
              {title}
              {required && <span className="text-red-400 ml-1">*</span>}
            </span>
            {images.length > 0 && (
              <span className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-1 rounded-full">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </span>
            )}
          </div>
          
          {!isReadOnly && (
            <button
              onClick={onTakePhoto}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-brand-primary hover:bg-brand-secondary text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {componentType === 'selfie' ? (
                <span className="w-3 h-3">🤳</span>
              ) : (
                <CameraIcon width={12} height={12} />
              )}
              {isLoading ? 'Processing...' : (componentType === 'selfie' ? 'Selfie' : 'Photo')}
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-3 p-2 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Images Display */}
        {images.length === 0 ? (
          <div className="flex items-center justify-center py-3 text-center" style={{ minHeight: '60px' }}>
            <div className="text-gray-500">
              <div className="w-6 h-6 mx-auto mb-1 opacity-50 text-lg">
                {componentType === 'selfie' ? '🤳' : '📷'}
              </div>
              <div className="text-xs">
                {isReadOnly ? 'No images captured' : 'Tap to capture images'}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-wrap gap-2"
            style={{
              maxHeight: '120px',
              overflowY: 'auto',
              minHeight: '64px',
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap'
            }}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group compact-image-container cursor-pointer"
                onClick={() => handleImageClick(image)}
                style={thumbnailContainerStyle}
              >
                {/* Thumbnail */}
                <img
                  src={image.dataUrl}
                  alt={`${componentType} ${index + 1}`}
                  className="compact-image-thumbnail"
                  style={thumbnailImageStyle}
                />

                {/* Delete Button */}
                {!isReadOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#DC2626',
                      color: 'white',
                      borderRadius: '50%',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      zIndex: 10,
                      opacity: isMobile ? 1 : 0,
                      transition: 'opacity 0.2s'
                    }}
                    className={isMobile ? '' : 'group-hover:opacity-100'}
                  >
                    ✕
                  </button>
                )}

                {/* Image Number Badge */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 4px',
                    borderTopRightRadius: '4px',
                    zIndex: 5
                  }}
                >
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Messages */}
        {required && images.length === 0 && !isReadOnly && (
          <div className="mt-2 text-xs text-red-400">
            ⚠️ {componentType === 'selfie' ? 'Selfie' : 'Photo'} is required
          </div>
        )}
        
        {images.length > 0 && (
          <div className="mt-2 text-xs text-green-400">
            ✅ {images.length} {componentType === 'selfie' ? 'selfie' : 'photo'}{images.length > 1 ? 's' : ''} captured
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isVisible={!!selectedImage}
          onClose={closeModal}
          onDelete={!isReadOnly ? () => {
            handleDeleteImage(selectedImage.id);
            closeModal();
          } : undefined}
          enhancedAddress={imageMetadata[selectedImage.id]?.enhancedAddress}
          validationResult={imageMetadata[selectedImage.id]?.validationResult}
        />
      )}
    </>
  );
};

export default CompactImageDisplay;
