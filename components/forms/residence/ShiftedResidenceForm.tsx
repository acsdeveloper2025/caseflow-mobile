import React, { useMemo, useState } from 'react';
import {
  Case, ShiftedResidenceReportData, AddressLocatable, AddressRating, RoomStatusShifted, MetPersonStatusShifted,
  TPCMetPerson, PremisesStatus, LocalityType, SightStatus, PoliticalConnection, DominatedArea,
  FeedbackFromNeighbour, FinalStatusShifted, CaseStatus, CapturedImage
} from '../../../types';
import { useCases } from '../../../context/CaseContext';
import { FormField, SelectField, TextAreaField } from '../../FormControls';
import ConfirmationModal from '../../ConfirmationModal';
import ImageCapture from '../../ImageCapture';
import SelfieCapture from '../../SelfieCapture';
import ReadOnlyIndicator from '../../ReadOnlyIndicator';
import AutoSaveFormWrapper from '../../AutoSaveFormWrapper';
import { FORM_TYPES } from '../../../constants/formTypes';
import {
  createImageChangeHandler,
  createSelfieImageChangeHandler,
  createAutoSaveImagesChangeHandler,
  combineImagesForAutoSave,
  createFormDataChangeHandler,
  createDataRestoredHandler
} from '../../../utils/imageAutoSaveHelpers';
import {
  createImageChangeHandler,
  createSelfieImageChangeHandler,
  createAutoSaveImagesChangeHandler,
  combineImagesForAutoSave,
  createFormDataChangeHandler,
  createDataRestoredHandler
} from '../../../utils/imageAutoSaveHelpers';

interface ShiftedResidenceFormProps {
  caseData: Case;
}

const getEnumOptions = (enumObject: object) => Object.values(enumObject).map(value => (
  <option key={value} value={value}>{value}</option>
));

const ShiftedResidenceForm: React.FC<ShiftedResidenceFormProps> = ({ caseData }) => {
  const { updateShiftedResidenceReport, updateCaseStatus, toggleSaveCase } = useCases();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const report = caseData.shiftedResidenceReport;
  const isReadOnly = caseData.status === CaseStatus.Completed || caseData.isSaved;
  const MIN_IMAGES = 5;

  // Auto-save handlers using helper functions
  const handleFormDataChange = createFormDataChangeHandler(
    updateShiftedResidenceReport,
    caseData.id,
    isReadOnly
  );

  const handleAutoSaveImagesChange = createAutoSaveImagesChangeHandler(
    updateShiftedResidenceReport,
    caseData.id,
    report,
    isReadOnly
  );

  const handleDataRestored = createDataRestoredHandler(
    updateShiftedResidenceReport,
    caseData.id,
    isReadOnly
  );

  if (!report) {
    return <p className="text-medium-text">No shifted residence report data available for this case.</p>;
  }
  
  const isFormValid = useMemo(() => {
    if (!report) return false;

    if (report.images.length < MIN_IMAGES) return false;

    // Require at least one selfie image
    if (!report.selfieImages || report.selfieImages.length === 0) return false;

    const checkFields = (fields: (keyof ShiftedResidenceReportData)[]) => fields.every(field => {
        const value = report[field];
        return value !== null && value !== undefined && value !== '';
    });

    const baseFields: (keyof ShiftedResidenceReportData)[] = [
        'addressLocatable', 'addressRating', 'roomStatus',
        'locality', 'addressStructure', 'addressFloor', 'addressStructureColor', 'doorColor',
        'doorNamePlateStatus', 'societyNamePlateStatus', 'landmark1', 'landmark2',
        'politicalConnection', 'dominatedArea', 'feedbackFromNeighbour', 'otherObservation', 'finalStatus',
        'shiftedPeriod' // Always required field
    ];

    if (!checkFields(baseFields)) return false;

    // Always required TPC validations (regardless of room status)
    if (report.tpcMetPerson1) {
        if (!report.tpcName1 || report.tpcName1.trim() === '') return false;
    }
    if (report.tpcMetPerson2) {
        if (!report.tpcName2 || report.tpcName2.trim() === '') return false;
    }

    // Conditional validation based on room status
    if (report.roomStatus === RoomStatusShifted.Opened) {
        const openedFields: (keyof ShiftedResidenceReportData)[] = [
            'metPersonName', 'metPersonStatus'
        ];
        if (!checkFields(openedFields)) return false;
    }

    if (report.roomStatus === RoomStatusShifted.Closed) {
        if (!report.premisesStatus) return false;
    }
    
    if (report.doorNamePlateStatus === SightStatus.Sighted) {
        if (!report.nameOnDoorPlate || report.nameOnDoorPlate.trim() === '') return false;
    }

    if (report.societyNamePlateStatus === SightStatus.Sighted) {
        if (!report.nameOnSocietyBoard || report.nameOnSocietyBoard.trim() === '') return false;
    }

    if (report.finalStatus === FinalStatusShifted.Hold) {
        if (!report.holdReason || report.holdReason.trim() === '') return false;
    }

    return true;
  }, [report]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: string | null = value;
    
    if (e.target.tagName === 'SELECT' && value === '') {
        processedValue = null;
    }

    const updates: Partial<ShiftedResidenceReportData> = { [name]: processedValue };
    updateShiftedResidenceReport(caseData.id, updates);
  };

  const handleImagesChange = createImageChangeHandler(
    updateShiftedResidenceReport,
    caseData.id,
    report,
    handleAutoSaveImagesChange
  );

  const handleSelfieImagesChange = createSelfieImageChangeHandler(
    updateShiftedResidenceReport,
    caseData.id,
    report,
    handleAutoSaveImagesChange
  );

  const options = useMemo(() => ({
    addressLocatable: getEnumOptions(AddressLocatable),
    addressRating: getEnumOptions(AddressRating),
    roomStatus: getEnumOptions(RoomStatusShifted),
    metPersonStatus: getEnumOptions(MetPersonStatusShifted),
    tpcMetPerson: getEnumOptions(TPCMetPerson),
    premisesStatus: getEnumOptions(PremisesStatus),
    localityType: getEnumOptions(LocalityType),
    sightStatus: getEnumOptions(SightStatus),
    politicalConnection: getEnumOptions(PoliticalConnection),
    dominatedArea: getEnumOptions(DominatedArea),
    feedbackFromNeighbour: getEnumOptions(FeedbackFromNeighbour),
    finalStatus: getEnumOptions(FinalStatusShifted),
  }), []);

  return (
    <AutoSaveFormWrapper
      caseId={caseData.id}
      formType={FORM_TYPES.RESIDENCE_SHIFTED}
      formData={report}
      images={combineImagesForAutoSave(report)}
      onFormDataChange={handleFormDataChange}
      onImagesChange={handleAutoSaveImagesChange}
      onDataRestored={handleDataRestored}
      autoSaveOptions={{
        enableAutoSave: !isReadOnly,
        showIndicator: !isReadOnly,
      }}
    >
      <div className="space-y-4 pt-4 border-t border-dark-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-brand-primary">Shifted Residence Report</h3>
        {isReadOnly && (
          <div className="flex items-center px-3 py-1 bg-gray-700 rounded-full border border-gray-600">
            <InfoIcon width={16} height={16} className="text-gray-400 mr-2" />
            <span className="text-xs text-gray-400 font-medium">
              {caseData.status === CaseStatus.Completed ? 'Case Submitted - Read Only' : 'Case Saved - Read Only'}
            </span>
          </div>
        )}
      </div>

      {/* Customer Information Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Customer Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm">
            <span className="text-medium-text">Customer Name: </span>
            <span className="text-light-text">{caseData.customer.name}</span>
          </div>
          <div className="text-sm">
            <span className="text-medium-text">Bank Name: </span>
            <span className="text-light-text">{caseData.bankName || 'N/A'}</span>
          </div>
          <div className="text-sm">
            <span className="text-medium-text">Product: </span>
            <span className="text-light-text">{caseData.product || 'N/A'}</span>
          </div>
          <div className="text-sm">
            <span className="text-medium-text">Trigger: </span>
            <span className="text-light-text">{caseData.trigger || 'N/A'}</span>
          </div>
        </div>
        <div className="text-sm">
          <span className="text-medium-text">Visit Address: </span>
          <span className="text-light-text">{caseData.visitAddress || 'N/A'}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm">
            <span className="text-medium-text">System Contact: </span>
            <span className="text-light-text">{caseData.systemContactNumber || 'N/A'}</span>
          </div>
          <div className="text-sm">
            <span className="text-medium-text">Customer Code: </span>
            <span className="text-light-text">{caseData.customerCallingCode || 'N/A'}</span>
          </div>
          <div className="text-sm">
            <span className="text-medium-text">Applicant Status: </span>
            <span className="text-light-text">{caseData.applicantStatus || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Address Verification Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Address Verification</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField label="Address Locatable" id="addressLocatable" name="addressLocatable" value={report.addressLocatable || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.addressLocatable}
          </SelectField>
          <SelectField label="Address Rating" id="addressRating" name="addressRating" value={report.addressRating || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.addressRating}
          </SelectField>
          <SelectField label="Room Status" id="roomStatus" name="roomStatus" value={report.roomStatus || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.roomStatus}
          </SelectField>
        </div>
      </div>

      {/* Personal Details Section - Only show if room is opened */}
      {report.roomStatus === RoomStatusShifted.Opened && (
        <div className="p-4 bg-yellow-900/20 rounded-lg space-y-4 border border-yellow-600/30">
          <h4 className="font-semibold text-yellow-400">Confirmation Details (Room Opened)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Met Person" id="metPersonName" name="metPersonName" value={report.metPersonName} onChange={handleChange} disabled={isReadOnly} />
            <SelectField label="Met Person Status" id="metPersonStatus" name="metPersonStatus" value={report.metPersonStatus || ''} onChange={handleChange} disabled={isReadOnly}>
              <option value="">Select...</option>
              {options.metPersonStatus}
            </SelectField>
          </div>
        </div>
      )}

      {/* Premises Details Section - Only show if room is closed */}
      {report.roomStatus === RoomStatusShifted.Closed && (
        <div className="p-4 bg-yellow-900/20 rounded-lg space-y-4 border border-yellow-600/30">
          <h4 className="font-semibold text-yellow-400">Premises Details (Room Closed)</h4>
          <SelectField label="Premises Status" id="premisesStatus" name="premisesStatus" value={report.premisesStatus || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.premisesStatus}
          </SelectField>
        </div>
      )}

      {/* Always Visible Fields Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Additional Details</h4>

        {/* Shifted Period */}
        <FormField label="Shifted Period" id="shiftedPeriod" name="shiftedPeriod" value={report.shiftedPeriod} onChange={handleChange} placeholder="e.g., 6 months ago" disabled={isReadOnly} />

        {/* Third Party Confirmation Section */}
        <div className="space-y-4">
          <h5 className="font-semibold text-brand-primary">Third Party Confirmation</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="TPC Met Person 1" id="tpcMetPerson1" name="tpcMetPerson1" value={report.tpcMetPerson1 || ''} onChange={handleChange} disabled={isReadOnly}>
              <option value="">Select...</option>
              {options.tpcMetPerson}
            </SelectField>
            <FormField label="Name of TPC 1" id="tpcName1" name="tpcName1" value={report.tpcName1} onChange={handleChange} disabled={isReadOnly} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="TPC Met Person 2" id="tpcMetPerson2" name="tpcMetPerson2" value={report.tpcMetPerson2 || ''} onChange={handleChange} disabled={isReadOnly}>
              <option value="">Select...</option>
              {options.tpcMetPerson}
            </SelectField>
            <FormField label="Name of TPC 2" id="tpcName2" name="tpcName2" value={report.tpcName2} onChange={handleChange} disabled={isReadOnly} />
          </div>
        </div>
      </div>

      {/* Property Details Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Property Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Locality" id="locality" name="locality" value={report.locality || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.localityType}
          </SelectField>
          <FormField label="Address Structure" id="addressStructure" name="addressStructure" value={report.addressStructure} onChange={handleChange} placeholder="e.g., G+7" disabled={isReadOnly} />
          <FormField label="Address Floor" id="addressFloor" name="addressFloor" value={report.addressFloor} onChange={handleChange} placeholder="e.g., 4" disabled={isReadOnly} />
          <FormField label="Address Structure Color" id="addressStructureColor" name="addressStructureColor" value={report.addressStructureColor} onChange={handleChange} disabled={isReadOnly} />
          <FormField label="Door Color" id="doorColor" name="doorColor" value={report.doorColor} onChange={handleChange} disabled={isReadOnly} />
        </div>

        {/* Name Plate Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Door Name Plate" id="doorNamePlateStatus" name="doorNamePlateStatus" value={report.doorNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.sightStatus}
          </SelectField>
          {report.doorNamePlateStatus === SightStatus.Sighted && (
            <FormField label="Name on Door Plate" id="nameOnDoorPlate" name="nameOnDoorPlate" value={report.nameOnDoorPlate} onChange={handleChange} disabled={isReadOnly} className="border-red-500" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Society Name Plate" id="societyNamePlateStatus" name="societyNamePlateStatus" value={report.societyNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.sightStatus}
          </SelectField>
          {report.societyNamePlateStatus === SightStatus.Sighted && (
            <FormField label="Name on Society Board" id="nameOnSocietyBoard" name="nameOnSocietyBoard" value={report.nameOnSocietyBoard} onChange={handleChange} disabled={isReadOnly} className="border-red-500" />
          )}
        </div>

        {/* Landmarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Landmark 1" id="landmark1" name="landmark1" value={report.landmark1} onChange={handleChange} disabled={isReadOnly} />
          <FormField label="Landmark 2" id="landmark2" name="landmark2" value={report.landmark2} onChange={handleChange} disabled={isReadOnly} />
        </div>
      </div>

      {/* Area Assessment Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Area Assessment</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField label="Political Connection" id="politicalConnection" name="politicalConnection" value={report.politicalConnection || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.politicalConnection}
          </SelectField>
          <SelectField label="Dominated Area" id="dominatedArea" name="dominatedArea" value={report.dominatedArea || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.dominatedArea}
          </SelectField>
          <SelectField label="Feedback from Neighbour" id="feedbackFromNeighbour" name="feedbackFromNeighbour" value={report.feedbackFromNeighbour || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.feedbackFromNeighbour}
          </SelectField>
        </div>
        <TextAreaField label="Other Observation" id="otherObservation" name="otherObservation" value={report.otherObservation} onChange={handleChange} disabled={isReadOnly} />
      </div>

      {/* Final Status Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Final Status</h4>
        <SelectField label="Final Status" id="finalStatus" name="finalStatus" value={report.finalStatus || ''} onChange={handleChange} disabled={isReadOnly}>
          <option value="">Select...</option>
          {options.finalStatus}
        </SelectField>
        {report.finalStatus === FinalStatusShifted.Hold && (
          <FormField label="Reason for Hold" id="holdReason" name="holdReason" value={report.holdReason} onChange={handleChange} disabled={isReadOnly} />
        )}
      </div>

       <ImageCapture
        images={report.images}
        onImagesChange={handleImagesChange}
        isReadOnly={isReadOnly}
        minImages={MIN_IMAGES}
      />

      {/* Selfie Capture Section */}
      <SelfieCapture
        images={report.selfieImages || []}
        onImagesChange={handleSelfieImagesChange}
        isReadOnly={isReadOnly}
        required={true}
        title="🤳 Verification Selfie (Required)"
      />

      {!isReadOnly && caseData.status === CaseStatus.InProgress && (
          <>
            <div className="mt-6">
                <button 
                    onClick={() => setIsConfirmModalOpen(true)}
                    disabled={!isFormValid}
                    className="w-full px-6 py-3 text-sm font-semibold rounded-md bg-brand-primary hover:bg-brand-secondary text-white transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    Submit
                </button>
                 {!isFormValid && <p className="text-xs text-red-400 text-center mt-2">Please fill all fields and capture at least {MIN_IMAGES} photos to submit.</p>}
            </div>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onSave={() => {
                    toggleSaveCase(caseData.id, true);
                    setIsConfirmModalOpen(false);
                }}
                onConfirm={() => {
                    updateCaseStatus(caseData.id, CaseStatus.Completed);
                    // Mark auto-save as completed
                    if ((window as any).markAutoSaveFormCompleted) {
                      (window as any).markAutoSaveFormCompleted();
                    }
                    setIsConfirmModalOpen(false);
                }}
                title="Submit or Save Case"
                confirmText="Submit Case"
                saveText="Save for Offline"
            >
                <p className="text-medium-text">
                    You can submit the case to mark it as complete, or save it for offline access if you have a poor internet connection.
                </p>
            </ConfirmationModal>
          </>
      )}
      </div>
    </AutoSaveFormWrapper>
  );
};

export default ShiftedResidenceForm;