import React, { useMemo, useState } from 'react';
import {
  Case, NspBusinessReportData, AddressLocatable, AddressRating, OfficeStatusOffice, BusinessExistence,
  ApplicantExistence, DesignationShiftedOffice, PremisesStatusBusiness, SightStatus, TPCMetPerson,
  TPCConfirmation, LocalityTypeResiCumOffice, DominatedArea, FeedbackFromNeighbour, FinalStatusShiftedBusiness, CaseStatus, CapturedImage
} from '../../../types';
import { useCases } from '../../../context/CaseContext';
import { FormField, SelectField, TextAreaField, NumberDropdownField } from '../../FormControls';
import ConfirmationModal from '../../ConfirmationModal';
import ImageCapture from '../../ImageCapture';
import SelfieCapture from '../../SelfieCapture';

interface NspBusinessFormProps {
  caseData: Case;
}

const getEnumOptions = (enumObject: object) => Object.values(enumObject).map(value => (
  <option key={value} value={value}>{value}</option>
));

const NspBusinessForm: React.FC<NspBusinessFormProps> = ({ caseData }) => {
  const { updateNspBusinessReport, updateCaseStatus, toggleSaveCase } = useCases();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const report = caseData.nspBusinessReport;
  const isReadOnly = caseData.status === CaseStatus.Completed || caseData.isSaved;
  const MIN_IMAGES = 5;

  if (!report) {
    return <p className="text-medium-text">No NSP Business report data available.</p>;
  }

  const isFormValid = useMemo(() => {
    if (!report) return false;

    if (report.images.length < MIN_IMAGES) return false;

    // Require at least one selfie image
    if (!report.selfieImages || report.selfieImages.length === 0) return false;

    const checkFields = (fields: (keyof NspBusinessReportData)[]) => fields.every(field => {
        const value = report[field];
        return value !== null && value !== undefined && value !== '';
    });

    const baseFields: (keyof NspBusinessReportData)[] = [
        'addressLocatable', 'addressRating', 'officeStatus', 'locality', 'addressStructure', 'addressStructureColor',
        'doorColor', 'landmark1', 'landmark2', 'dominatedArea', 'feedbackFromNeighbour', 'otherObservation', 'finalStatus',
        // Always required fields regardless of office status
        'businessExistance', 'applicantExistance', 'companyNamePlateStatus'
    ];
    if (!checkFields(baseFields)) return false;

    // Always required TPC validations (regardless of office status)
    if (report.tpcMetPerson1) {
        if (!report.nameOfTpc1 || report.nameOfTpc1.trim() === '' || !report.tpcConfirmation1) return false;
    }
    if (report.tpcMetPerson2) {
        if (!report.nameOfTpc2 || report.nameOfTpc2.trim() === '' || !report.tpcConfirmation2) return false;
    }

    // Always required Company Name Plate validation
    if (report.companyNamePlateStatus === SightStatus.Sighted) {
        if (!report.nameOnBoard || report.nameOnBoard.trim() === '') return false;
    }

    // Conditional validation - only when office is open
    if (report.officeStatus === OfficeStatusOffice.Opened) {
        const openedOnlyFields: (keyof NspBusinessReportData)[] = [
            'metPerson', 'designation', 'premisesStatus'
        ];
        if (!checkFields(openedOnlyFields)) return false;

        if (report.premisesStatus !== PremisesStatusBusiness.Vacant) {
          if (!report.currentCompanyName) return false;
        }
    }
    
    if (report.finalStatus === FinalStatusShiftedBusiness.Hold) {
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

    const updates: Partial<NspBusinessReportData> = { [name]: processedValue };
    updateNspBusinessReport(caseData.id, updates);
  };
  
  const handleImagesChange = (images: CapturedImage[]) => {
    updateNspBusinessReport(caseData.id, { images });
  };

  const handleSelfieImagesChange = (selfieImages: CapturedImage[]) => {
    updateNspBusinessReport(caseData.id, { selfieImages });
  };

  const options = useMemo(() => ({
    addressLocatable: getEnumOptions(AddressLocatable),
    addressRating: getEnumOptions(AddressRating),
    officeStatus: getEnumOptions(OfficeStatusOffice),
    businessExistence: getEnumOptions(BusinessExistence),
    applicantExistence: getEnumOptions(ApplicantExistence),
    designation: getEnumOptions(DesignationShiftedOffice),
    premisesStatus: getEnumOptions(PremisesStatusBusiness),
    sightStatus: getEnumOptions(SightStatus),
    tpcMetPerson: getEnumOptions(TPCMetPerson),
    tpcConfirmation: getEnumOptions(TPCConfirmation),
    localityType: getEnumOptions(LocalityTypeResiCumOffice),
    dominatedArea: getEnumOptions(DominatedArea),
    feedbackFromNeighbour: getEnumOptions(FeedbackFromNeighbour),
    finalStatus: getEnumOptions(FinalStatusShiftedBusiness),
  }), []);

  return (
    <div className="space-y-4 pt-4 border-t border-dark-border">
      <h3 className="text-lg font-semibold text-brand-primary">NSP Business Report</h3>

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
          <SelectField label="Office Status" id="officeStatus" name="officeStatus" value={report.officeStatus || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.officeStatus}
          </SelectField>
        </div>
      </div>

      {/* Always Visible Business Details Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Business Details</h4>

        {/* Business Existence Details - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Business Existance" id="businessExistance" name="businessExistance" value={report.businessExistance || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.businessExistence}
          </SelectField>
          <SelectField label="Applicant Existance" id="applicantExistance" name="applicantExistance" value={report.applicantExistance || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.applicantExistence}
          </SelectField>
        </div>

        {/* Company Name Plate - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Company Name Plate" id="companyNamePlateStatus" name="companyNamePlateStatus" value={report.companyNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.sightStatus}
          </SelectField>
          {report.companyNamePlateStatus === SightStatus.Sighted && (
            <FormField label="Name on Board" id="nameOnBoard" name="nameOnBoard" value={report.nameOnBoard} onChange={handleChange} disabled={isReadOnly} className="border-red-500" />
          )}
        </div>
      </div>

      {/* Always Visible Third Party Confirmation Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Third Party Confirmation</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField label="TPC Met Person 1" id="tpcMetPerson1" name="tpcMetPerson1" value={report.tpcMetPerson1 || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.tpcMetPerson}
          </SelectField>
          <FormField label="Name of TPC 1" id="nameOfTpc1" name="nameOfTpc1" value={report.nameOfTpc1} onChange={handleChange} disabled={isReadOnly} />
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
          <FormField label="Name of TPC 2" id="nameOfTpc2" name="nameOfTpc2" value={report.nameOfTpc2} onChange={handleChange} disabled={isReadOnly} />
          <SelectField label="TPC Confirmation 2" id="tpcConfirmation2" name="tpcConfirmation2" value={report.tpcConfirmation2 || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.tpcConfirmation}
          </SelectField>
        </div>
      </div>

      {/* Conditional Fields - Only show if office is open */}
      {report.officeStatus === OfficeStatusOffice.Opened && (
        <div className="p-4 bg-yellow-900/20 rounded-lg space-y-4 border border-yellow-600/30">
          <h4 className="font-semibold text-yellow-400">Additional Details (Office Open)</h4>

          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Met Person" id="metPerson" name="metPerson" value={report.metPerson} onChange={handleChange} disabled={isReadOnly} />
            <SelectField label="Designation" id="designation" name="designation" value={report.designation || ''} onChange={handleChange} disabled={isReadOnly}>
              <option value="">Select...</option>
              {options.designation}
            </SelectField>
            <SelectField label="Premises Status" id="premisesStatus" name="premisesStatus" value={report.premisesStatus || ''} onChange={handleChange} disabled={isReadOnly}>
              <option value="">Select...</option>
              {options.premisesStatus}
            </SelectField>
          </div>

          {/* Current Company Details - Conditional on Premises Status */}
          {report.premisesStatus !== PremisesStatusBusiness.Vacant && (
            <FormField label="Current Company Name" id="currentCompanyName" name="currentCompanyName" value={report.currentCompanyName} onChange={handleChange} disabled={isReadOnly} />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField label="Locality" id="locality" name="locality" value={report.locality || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.localityType}</SelectField>
        <NumberDropdownField label="Address Structure" id="addressStructure" name="addressStructure" value={report.addressStructure || ''} onChange={handleChange} min={1} max={150} disabled={isReadOnly} />
        <FormField label="Address Structure Color" id="addressStructureColor" name="addressStructureColor" value={report.addressStructureColor} onChange={handleChange} disabled={isReadOnly} />
        <FormField label="Door Color" id="doorColor" name="doorColor" value={report.doorColor} onChange={handleChange} disabled={isReadOnly} />
        <SelectField label="Dominated Area" id="dominatedArea" name="dominatedArea" value={report.dominatedArea || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.dominatedArea}</SelectField>
        <SelectField label="Feedback from Neighbour" id="feedbackFromNeighbour" name="feedbackFromNeighbour" value={report.feedbackFromNeighbour || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.feedbackFromNeighbour}</SelectField>
      </div>
      
      <FormField label="Landmark 1" id="landmark1" name="landmark1" value={report.landmark1} onChange={handleChange} disabled={isReadOnly} />
      <FormField label="Landmark 2" id="landmark2" name="landmark2" value={report.landmark2} onChange={handleChange} disabled={isReadOnly} />
      <TextAreaField label="Other Observation" id="otherObservation" name="otherObservation" value={report.otherObservation} onChange={handleChange} disabled={isReadOnly} />
      
      <SelectField label="Final Status" id="finalStatus" name="finalStatus" value={report.finalStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.finalStatus}</SelectField>
      {report.finalStatus === FinalStatusShiftedBusiness.Hold && <FormField label="Reason for Hold" id="holdReason" name="holdReason" value={report.holdReason} onChange={handleChange} disabled={isReadOnly} />}

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
  );
};

export default NspBusinessForm;