import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAutoSave, AutoSaveStatus } from '../hooks/useAutoSave';
import { AutoSaveData } from '../services/autoSaveService';
import { CapturedImage } from '../types';
import AutoSaveIndicator from './AutoSaveIndicator';
import AutoSaveRecoveryModal from './AutoSaveRecoveryModal';

interface AutoSaveFormWrapperProps {
  caseId: string;
  formType: string;
  formData: any;
  images?: CapturedImage[];
  children: React.ReactNode;
  onDataRestored?: (data: AutoSaveData) => void;
  onFormDataChange?: (formData: any) => void;
  onImagesChange?: (images: CapturedImage[]) => void;
  autoSaveOptions?: {
    debounceMs?: number;
    enableAutoSave?: boolean;
    showIndicator?: boolean;
    showRecoveryModal?: boolean;
  };
  className?: string;
}

const AutoSaveFormWrapper: React.FC<AutoSaveFormWrapperProps> = ({
  caseId,
  formType,
  formData,
  images = [],
  children,
  onDataRestored,
  onFormDataChange,
  onImagesChange,
  autoSaveOptions = {},
  className = ''
}) => {
  const {
    debounceMs = 2000,
    enableAutoSave = true,
    showIndicator = true,
    showRecoveryModal = true
  } = autoSaveOptions;

  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryData, setRecoveryData] = useState<AutoSaveData | null>(null);
  const [hasCheckedForRecovery, setHasCheckedForRecovery] = useState(false);
  const isInitialMount = useRef(true);
  const lastSaveDataRef = useRef<string>('');

  const {
    autoSaveStatus,
    saveFormData,
    restoreFormData,
    clearAutoSaveData,
    markFormCompleted
  } = useAutoSave(caseId, formType, {
    debounceMs,
    enableAutoSave,
    onAutoSaveSuccess: (data) => {
      console.log('Auto-save successful:', data);
    },
    onAutoSaveError: (error) => {
      console.error('Auto-save error:', error);
    },
    onDataRestored: (data) => {
      if (onDataRestored) {
        onDataRestored(data);
      }
    }
  });

  /**
   * Check for existing saved data on mount
   */
  useEffect(() => {
    if (isInitialMount.current && !hasCheckedForRecovery && showRecoveryModal) {
      isInitialMount.current = false;
      
      const checkForRecovery = async () => {
        try {
          const savedData = await restoreFormData();
          if (savedData && !savedData.isComplete) {
            setRecoveryData(savedData);
            setShowRecovery(true);
          }
        } catch (error) {
          console.error('Error checking for recovery data:', error);
        } finally {
          setHasCheckedForRecovery(true);
        }
      };

      // Small delay to ensure component is fully mounted
      setTimeout(checkForRecovery, 100);
    }
  }, [restoreFormData, hasCheckedForRecovery, showRecoveryModal]);

  /**
   * Auto-save when form data or images change
   */
  useEffect(() => {
    if (!hasCheckedForRecovery || !enableAutoSave) return;

    const currentData = JSON.stringify({ formData, images });
    
    // Skip auto-save if data hasn't changed
    if (currentData === lastSaveDataRef.current) return;
    
    // Skip auto-save on initial mount to avoid saving empty forms
    if (isInitialMount.current) {
      lastSaveDataRef.current = currentData;
      return;
    }

    // Only auto-save if there's actual content
    const hasContent = Object.values(formData || {}).some(value => 
      value !== null && value !== undefined && value !== ''
    ) || images.length > 0;

    if (hasContent) {
      saveFormData(formData, images);
      lastSaveDataRef.current = currentData;
    }
  }, [formData, images, saveFormData, hasCheckedForRecovery, enableAutoSave]);

  /**
   * Handle recovery modal actions
   */
  const handleRestoreData = useCallback(async (data: AutoSaveData) => {
    try {
      // Restore form data
      if (onFormDataChange && data.formData) {
        onFormDataChange(data.formData);
      }

      // Restore images
      if (onImagesChange && data.images) {
        onImagesChange(data.images);
      }

      // Call the onDataRestored callback
      if (onDataRestored) {
        onDataRestored(data);
      }

      setShowRecovery(false);
      setRecoveryData(null);
    } catch (error) {
      console.error('Error restoring data:', error);
    }
  }, [onFormDataChange, onImagesChange, onDataRestored]);

  const handleDiscardRecovery = useCallback(async () => {
    try {
      await clearAutoSaveData();
      setShowRecovery(false);
      setRecoveryData(null);
    } catch (error) {
      console.error('Error discarding recovery data:', error);
    }
  }, [clearAutoSaveData]);

  const handleCancelRecovery = useCallback(() => {
    setShowRecovery(false);
    setRecoveryData(null);
  }, []);

  /**
   * Mark form as completed (call this when form is successfully submitted)
   */
  const handleFormCompleted = useCallback(async () => {
    try {
      await markFormCompleted();
    } catch (error) {
      console.error('Error marking form as completed:', error);
    }
  }, [markFormCompleted]);

  // Expose the completion handler to parent components
  useEffect(() => {
    // Add a global reference so parent components can call it
    (window as any).markAutoSaveFormCompleted = handleFormCompleted;
    
    return () => {
      delete (window as any).markAutoSaveFormCompleted;
    };
  }, [handleFormCompleted]);

  return (
    <div className={`auto-save-form-wrapper ${className}`}>
      {/* Auto-save indicator */}
      {showIndicator && enableAutoSave && (
        <div className="mb-4 flex justify-end">
          <AutoSaveIndicator 
            status={autoSaveStatus} 
            showDetails={true}
          />
        </div>
      )}

      {/* Form content */}
      <div className="auto-save-form-content">
        {children}
      </div>

      {/* Recovery modal */}
      {showRecoveryModal && (
        <AutoSaveRecoveryModal
          isVisible={showRecovery}
          savedData={recoveryData}
          onRestore={handleRestoreData}
          onDiscard={handleDiscardRecovery}
          onCancel={handleCancelRecovery}
        />
      )}
    </div>
  );
};

export default AutoSaveFormWrapper;

// Export additional utilities for manual control
export const useAutoSaveFormWrapper = (caseId: string, formType: string) => {
  const autoSave = useAutoSave(caseId, formType);
  
  return {
    ...autoSave,
    markCompleted: autoSave.markFormCompleted,
    hasUnsavedChanges: autoSave.autoSaveStatus.hasUnsavedChanges,
    isAutoSaving: autoSave.autoSaveStatus.isAutoSaving,
    lastSaved: autoSave.autoSaveStatus.lastSaved
  };
};
