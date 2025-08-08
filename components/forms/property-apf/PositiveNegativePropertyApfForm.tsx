import React, { useMemo, useState } from 'react';
import {
  Case, PositivePropertyApfReportData, NspPropertyApfReportData, AddressLocatable, AddressRating,
  BuildingStatusApf, RelationshipApf, TPCMetPerson, TPCConfirmation,
  LocalityTypeResiCumOffice, SightStatus, PoliticalConnection, DominatedArea,
  FeedbackFromNeighbour, FinalStatus, CaseStatus, CapturedImage
} from '../../../types';
import { useCases } from '../../../context/CaseContext';
import { FormField, SelectField, TextAreaField } from '../../FormControls';
import ConfirmationModal from '../../ConfirmationModal';
import ImageCapture from '../../ImageCapture';
import SelfieCapture from '../../SelfieCapture';
import AutoSaveFormWrapper from '../../AutoSaveFormWrapper';
import { FORM_TYPES } from '../../../constants/formTypes';

interface PositiveNegativePropertyApfFormProps {
  caseData: Case;
}

// Status enum for the unified form
enum VerificationStatus {
  Positive = 'Positive',
  Negative = 'Negative'
}

// Construction Activity enum
enum ConstructionActivity {
  Seen = 'SEEN',
  ConstructionStop = 'CONSTRUCTION IS STOP',
  PlotVacant = 'PLOT IS VACANT'
}

// Company Name Board enum
enum CompanyNameBoard {
  SightedAs = 'SIGHTED AS',
  NotSighted = 'NOT SIGHTED'
}

const getEnumOptions = (enumObject: object) => Object.values(enumObject).map(value => (
  <option key={value} value={value}>{value}</option>
));

const PositiveNegativePropertyApfForm: React.FC<PositiveNegativePropertyApfFormProps> = ({ caseData }) => {
  const { updatePositivePropertyApfReport, updateNspPropertyApfReport, updateCaseStatus, toggleSaveCase } = useCases();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(VerificationStatus.Positive);
  const [constructionActivity, setConstructionActivity] = useState<ConstructionActivity>(ConstructionActivity.Seen);
  const [companyNameBoard, setCompanyNameBoard] = useState<CompanyNameBoard>(CompanyNameBoard.NotSighted);

  // Determine which report to use based on current verification status
  const report = verificationStatus === VerificationStatus.Positive
    ? caseData.positivePropertyApfReport
    : caseData.nspPropertyApfReport;

  const isReadOnly = caseData.status === CaseStatus.Completed || caseData.isSaved;
  const MIN_IMAGES = 5;

  // Auto-save handlers
  const handleFormDataChange = (formData: any) => {
    if (!isReadOnly) {
      if (verificationStatus === VerificationStatus.Positive) {
        updatePositivePropertyApfReport(caseData.id, formData);
      } else {
        updateNspPropertyApfReport(caseData.id, formData);
      }
    }
  };

  const handleAutoSaveImagesChange = (images: CapturedImage[]) => {
    if (!isReadOnly && report) {
      if (verificationStatus === VerificationStatus.Positive) {
        updatePositivePropertyApfReport(caseData.id, { ...report, images });
      } else {
        updateNspPropertyApfReport(caseData.id, { ...report, images });
      }
    }
  };

  const handleDataRestored = (data: any) => {
    if (!isReadOnly && data.formData) {
      if (verificationStatus === VerificationStatus.Positive) {
        updatePositivePropertyApfReport(caseData.id, data.formData);
      } else {
        updateNspPropertyApfReport(caseData.id, data.formData);
      }
    }
  };

  if (!report) {
    return <p className="text-medium-text">No Property APF report data available.</p>;
  }

  const isFormValid = useMemo(() => {
    if (!report) return false;

    if (report.images.length < MIN_IMAGES) return false;

    // Require at least one selfie image
    if (!report.selfieImages || report.selfieImages.length === 0) return false;

    const checkFields = (fields: string[]) => fields.every(field => {
        const value = (report as any)[field];
        return value !== null && value !== undefined && value !== '';
    });

    // Base fields common to both positive and negative
    const baseFields = [
        'addressLocatable', 'addressRating',
        'tpcMetPerson1', 'nameOfTpc1', 'tpcConfirmation1', 'tpcMetPerson2', 'nameOfTpc2', 'tpcConfirmation2',
        'locality', 'addressStructure', 'addressStructureColor', 'doorColor',
        'doorNamePlateStatus', 'landmark1', 'landmark2', 'politicalConnection',
        'dominatedArea', 'feedbackFromNeighbour', 'otherObservation', 'finalStatus'
    ];

    if (!checkFields(baseFields)) return false;

    // Construction Activity specific validation
    if (constructionActivity === ConstructionActivity.ConstructionStop) {
        const constructionStopFields = [
            'buildingStatus', 'activityStopReason', 'projectName', 'projectStartedDate',
            'projectCompletionDate', 'totalWing', 'totalFlats', 'projectCompletionPercent',
            'staffStrength', 'staffSeen', 'nameOnBoard'
        ];
        // Note: These fields would need to be added to the report data types
        // For now, we'll validate the existing fields that are available
    }

    // Conditional fields when construction activity is SEEN
    if (constructionActivity === ConstructionActivity.Seen) {
        const seenFields = ['metPerson', 'propertyOwnerName'];
        if (verificationStatus === VerificationStatus.Positive) {
            seenFields.push('relationship', 'approxArea');
        } else {
            seenFields.push('relationship'); // For negative, relationship is string not enum
        }
        if (!checkFields(seenFields)) return false;
    }

    // Conditional fields for name plates
    if (report.doorNamePlateStatus === SightStatus.Sighted) {
        if (!report.nameOnDoorPlate || report.nameOnDoorPlate.trim() === '') return false;
    }
    if (companyNameBoard === CompanyNameBoard.SightedAs) {
        // Validate name on board field when company name board is sighted
        // This would need to be added to the report data types
    }
    
    if (report.finalStatus === FinalStatus.Hold) {
        if (!report.holdReason || report.holdReason.trim() === '') return false;
    }

    return true;
  }, [report, verificationStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number | null = value;
    
    if (e.target.tagName === 'SELECT' && value === '') {
        processedValue = null;
    }

    // Handle numeric fields
    if (name === 'approxArea' && value !== '') {
        processedValue = parseInt(value, 10);
    }

    const updates = { [name]: processedValue };
    
    if (verificationStatus === VerificationStatus.Positive) {
        updatePositivePropertyApfReport(caseData.id, updates as Partial<PositivePropertyApfReportData>);
    } else {
        updateNspPropertyApfReport(caseData.id, updates as Partial<NspPropertyApfReportData>);
    }
  };

  const handleStatusChange = (newStatus: VerificationStatus) => {
    setVerificationStatus(newStatus);
  };
  
  const handleImagesChange = (images: CapturedImage[]) => {
    const updates = { images };
    if (verificationStatus === VerificationStatus.Positive) {
        updatePositivePropertyApfReport(caseData.id, updates);
    } else {
        updateNspPropertyApfReport(caseData.id, updates);
    }
  };

  const handleSelfieImagesChange = (selfieImages: CapturedImage[]) => {
    const updates = { selfieImages };
    if (verificationStatus === VerificationStatus.Positive) {
        updatePositivePropertyApfReport(caseData.id, updates);
    } else {
        updateNspPropertyApfReport(caseData.id, updates);
    }
  };
  
  const options = useMemo(() => ({
    addressLocatable: getEnumOptions(AddressLocatable),
    addressRating: getEnumOptions(AddressRating),
    buildingStatus: getEnumOptions(BuildingStatusApf),
    relationship: getEnumOptions(RelationshipApf),
    tpcMetPerson: getEnumOptions(TPCMetPerson),
    tpcConfirmation: getEnumOptions(TPCConfirmation),
    localityType: getEnumOptions(LocalityTypeResiCumOffice),
    sightStatus: getEnumOptions(SightStatus),
    politicalConnection: getEnumOptions(PoliticalConnection),
    dominatedArea: getEnumOptions(DominatedArea),
    feedbackFromNeighbour: getEnumOptions(FeedbackFromNeighbour),
    finalStatus: getEnumOptions(FinalStatus),
    constructionActivity: getEnumOptions(ConstructionActivity),
    companyNameBoard: getEnumOptions(CompanyNameBoard),
  }), []);

  return (
    <AutoSaveFormWrapper
      caseId={caseData.id}
      formType={verificationStatus === VerificationStatus.Positive ? FORM_TYPES.PROPERTY_APF_POSITIVE : FORM_TYPES.PROPERTY_APF_NSP}
      formData={report}
      images={report?.images || []}
      onFormDataChange={handleFormDataChange}
      onImagesChange={handleAutoSaveImagesChange}
      onDataRestored={handleDataRestored}
      autoSaveOptions={{
        enableAutoSave: !isReadOnly,
        showIndicator: !isReadOnly,
        showRecoveryModal: !isReadOnly,
      }}
    >
      <div className="space-y-4 pt-4 border-t border-dark-border">
      <h3 className="text-lg font-semibold text-brand-primary">Property APF Positive & Negative Report</h3>

      {/* Customer Information Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Customer Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-medium-text">Customer Name</span>
            <span className="block text-light-text">{caseData.customer.name}</span>
          </div>
          <div>
            <span className="text-sm text-medium-text">Bank Name</span>
            <span className="block text-light-text">{caseData.bankName || 'N/A'}</span>
          </div>
          <div>
            <span className="text-sm text-medium-text">Product</span>
            <span className="block text-light-text">{caseData.product || 'N/A'}</span>
          </div>
          <div>
            <span className="text-sm text-medium-text">Trigger</span>
            <span className="block text-light-text">{caseData.trigger || 'N/A'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-sm text-medium-text">Visit Address</span>
            <span className="block text-light-text">{caseData.visitAddress || 'N/A'}</span>
          </div>
          <div>
            <span className="text-sm text-medium-text">System Contact Number</span>
            <span className="block text-light-text">{caseData.systemContactNumber || 'N/A'}</span>
          </div>
          <div>
            <span className="text-sm text-medium-text">Customer Calling Code</span>
            <span className="block text-light-text">{caseData.customerCallingCode || 'N/A'}</span>
          </div>
          <div>
            <span className="text-sm text-medium-text">Applicant Status</span>
            <span className="block text-light-text">{caseData.applicantStatus || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Status Selection Section */}
      <div className="p-4 bg-yellow-900/20 rounded-lg space-y-4 border border-yellow-600/30">
        <h4 className="font-semibold text-yellow-400">Verification Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField 
            label="Verification Status" 
            id="verificationStatus" 
            name="verificationStatus" 
            value={verificationStatus} 
            onChange={(e) => handleStatusChange(e.target.value as VerificationStatus)} 
            disabled={isReadOnly}
          >
            <option value={VerificationStatus.Positive}>Positive</option>
            <option value={VerificationStatus.Negative}>Negative</option>
          </SelectField>
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
          <SelectField
            label="Construction Activity"
            id="constructionActivity"
            name="constructionActivity"
            value={constructionActivity}
            onChange={(e) => setConstructionActivity(e.target.value as ConstructionActivity)}
            disabled={isReadOnly}
          >
            <option value="">Select...</option>
            {options.constructionActivity}
          </SelectField>
        </div>
      </div>

      {/* Construction Stop Conditional Fields - Red highlighted */}
      {constructionActivity === ConstructionActivity.ConstructionStop && (
        <div className="p-4 bg-red-900/20 rounded-lg space-y-4 border border-red-600/30">
          <h4 className="font-semibold text-red-400">Construction Stop Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Building Status" id="buildingStatus" name="buildingStatus" value={report.buildingStatus || ''} onChange={handleChange} disabled={isReadOnly} />
            <FormField label="Activity Stop Reason" id="activityStopReason" name="activityStopReason" value="" onChange={handleChange} disabled={isReadOnly} />
            <FormField label="Project Name" id="projectName" name="projectName" value="" onChange={handleChange} disabled={isReadOnly} />
            <FormField label="Project Started Date" id="projectStartedDate" name="projectStartedDate" type="date" value="" onChange={handleChange} disabled={isReadOnly} />
            <FormField label="Project Completion Date" id="projectCompletionDate" name="projectCompletionDate" type="date" value="" onChange={handleChange} disabled={isReadOnly} />
            <FormField label="Total Wing" id="totalWing" name="totalWing" value="" onChange={handleChange} disabled={isReadOnly} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Total Flats" id="totalFlats" name="totalFlats" value="" onChange={handleChange} disabled={isReadOnly} />
            <FormField label="Project Completion %" id="projectCompletionPercent" name="projectCompletionPercent" type="number" value="" onChange={handleChange} disabled={isReadOnly} />
            <FormField label="Staff Strength" id="staffStrength" name="staffStrength" type="number" value="" onChange={handleChange} disabled={isReadOnly} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Staff Seen" id="staffSeen" name="staffSeen" type="number" value="" onChange={handleChange} disabled={isReadOnly} />
            <FormField label="Name on Board" id="nameOnBoard" name="nameOnBoard" value="" onChange={handleChange} disabled={isReadOnly} />
          </div>
        </div>
      )}

      {/* Conditional Fields - Only show if construction activity is SEEN */}
      {constructionActivity === ConstructionActivity.Seen && (
        <div className="p-4 bg-yellow-900/20 rounded-lg space-y-4 border border-yellow-600/30">
          <h4 className="font-semibold text-yellow-400">Additional Details (Construction Seen)</h4>

          {/* Always visible fields when construction activity is SEEN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Met Person" id="metPerson" name="metPerson" value={report.metPerson || ''} onChange={handleChange} disabled={isReadOnly} />

            {verificationStatus === VerificationStatus.Positive ? (
              <SelectField label="Relationship" id="relationship" name="relationship" value={(report as PositivePropertyApfReportData).relationship || ''} onChange={handleChange} disabled={isReadOnly}>
                <option value="">Select...</option>
                {options.relationship}
              </SelectField>
            ) : (
              <FormField label="Relationship" id="relationship" name="relationship" value={(report as NspPropertyApfReportData).relationship || ''} onChange={handleChange} disabled={isReadOnly} />
            )}

            {/* Property Owner Name - Always visible when construction activity is SEEN, regardless of flat status */}
            <FormField label="Property Owner Name" id="propertyOwnerName" name="propertyOwnerName" value={report.propertyOwnerName || ''} onChange={handleChange} disabled={isReadOnly} />
          </div>

          {/* Approx Area - Only for Positive verification status */}
          {verificationStatus === VerificationStatus.Positive && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Approx Area"
                id="approxArea"
                name="approxArea"
                type="number"
                value={(report as PositivePropertyApfReportData).approxArea?.toString() || ''}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>
          )}
        </div>
      )}

      {/* Third Party Confirmation Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Third Party Confirmation</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField label="TPC Met Person 1" id="tpcMetPerson1" name="tpcMetPerson1" value={report.tpcMetPerson1 || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.tpcMetPerson}
          </SelectField>
          <FormField label="Name of TPC 1" id="nameOfTpc1" name="nameOfTpc1" value={report.nameOfTpc1 || ''} onChange={handleChange} disabled={isReadOnly} />
          <SelectField label="TPC Confirmation 1" id="tpcConfirmation1" name="tpcConfirmation1" value={report.tpcConfirmation1 || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.tpcConfirmation}
          </SelectField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField label="TPC Met Person 2" id="tpcMetPerson2" name="tpcMetPerson2" value={report.tpcMetPerson2 || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.tpcMetPerson}
          </SelectField>
          <FormField label="Name of TPC 2" id="nameOfTpc2" name="nameOfTpc2" value={report.nameOfTpc2 || ''} onChange={handleChange} disabled={isReadOnly} />
          <SelectField label="TPC Confirmation 2" id="tpcConfirmation2" name="tpcConfirmation2" value={report.tpcConfirmation2 || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.tpcConfirmation}
          </SelectField>
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
          <FormField label="Address Structure" id="addressStructure" name="addressStructure" value={report.addressStructure || ''} onChange={handleChange} placeholder="e.g., G+7" disabled={isReadOnly} />
          <FormField label="Address Structure Color" id="addressStructureColor" name="addressStructureColor" value={report.addressStructureColor || ''} onChange={handleChange} disabled={isReadOnly} />
          <FormField label="Door Color" id="doorColor" name="doorColor" value={report.doorColor || ''} onChange={handleChange} disabled={isReadOnly} />
        </div>

        {/* Name Plates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Door Name Plate" id="doorNamePlateStatus" name="doorNamePlateStatus" value={report.doorNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.sightStatus}
          </SelectField>
          {report.doorNamePlateStatus === SightStatus.Sighted && (
            <FormField label="Name on Door Plate" id="nameOnDoorPlate" name="nameOnDoorPlate" value={report.nameOnDoorPlate || ''} onChange={handleChange} disabled={isReadOnly} className="border-red-500" />
          )}
          <SelectField
            label="Company Name Board"
            id="companyNameBoard"
            name="companyNameBoard"
            value={companyNameBoard}
            onChange={(e) => setCompanyNameBoard(e.target.value as CompanyNameBoard)}
            disabled={isReadOnly}
          >
            <option value="">Select...</option>
            {options.companyNameBoard}
          </SelectField>
          {companyNameBoard === CompanyNameBoard.SightedAs && (
            <FormField label="Name on Board" id="nameOnBoard" name="nameOnBoard" value="" onChange={handleChange} disabled={isReadOnly} className="border-red-500 bg-red-900/20" />
          )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Landmark 1" id="landmark1" name="landmark1" value={report.landmark1 || ''} onChange={handleChange} disabled={isReadOnly} />
          <FormField label="Landmark 2" id="landmark2" name="landmark2" value={report.landmark2 || ''} onChange={handleChange} disabled={isReadOnly} />
        </div>
        <TextAreaField label="Other Observation" id="otherObservation" name="otherObservation" value={report.otherObservation || ''} onChange={handleChange} disabled={isReadOnly} />
      </div>

      {/* Final Status Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Final Status</h4>
        <SelectField label="Final Status" id="finalStatus" name="finalStatus" value={report.finalStatus || ''} onChange={handleChange} disabled={isReadOnly}>
          <option value="">Select...</option>
          {options.finalStatus}
        </SelectField>
        {report.finalStatus === FinalStatus.Hold && (
          <FormField label="Reason for Hold" id="holdReason" name="holdReason" value={report.holdReason || ''} onChange={handleChange} disabled={isReadOnly} />
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

export default PositiveNegativePropertyApfForm;
