import React, { useMemo, useState } from 'react';
import {
  Case, NspResiCumOfficeReportData, AddressTraceable, AddressLocatable, AddressRating, ResiCumOfficeStatus,
  MetPersonStatusShifted, TPCMetPerson, LocalityTypeResiCumOffice, SightStatus, DominatedArea, FinalStatus, CaseStatus, CapturedImage
} from '../../../types';
import { useCases } from '../../../context/CaseContext';
import { FormField, SelectField, TextAreaField, NumberDropdownField } from '../../FormControls';
import ConfirmationModal from '../../ConfirmationModal';
import ImageCapture from '../../ImageCapture';
import SelfieCapture from '../../SelfieCapture';
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

interface NspResiCumOfficeFormProps {
  caseData: Case;
}

const getEnumOptions = (enumObject: object) => Object.values(enumObject).map(value => (
  <option key={value} value={value}>{value}</option>
));

const NspResiCumOfficeForm: React.FC<NspResiCumOfficeFormProps> = ({ caseData }) => {
  const { updateNspResiCumOfficeReport, updateCaseStatus, toggleSaveCase } = useCases();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const report = caseData.nspResiCumOfficeReport;
  const isReadOnly = caseData.status === CaseStatus.Completed || caseData.isSaved;
  const MIN_IMAGES = 5;

  // Auto-save handlers
  const handleFormDataChange = (formData: any) => {
    if (!isReadOnly) {
      updateNspResiCumOfficeReport(caseData.id, formData);
    }
  };

  const handleAutoSaveImagesChange = (images: CapturedImage[]) => {
    if (!isReadOnly && report) {
      updateNspResiCumOfficeReport(caseData.id, { ...report, images });
    }
  };

  const handleDataRestored = (data: any) => {
    if (!isReadOnly && data.formData) {
      updateNspResiCumOfficeReport(caseData.id, data.formData);
    }
  };

  if (!report) {
    return <p className="text-medium-text">No NSP Resi-cum-Office report data available.</p>;
  }

  const isFormValid = useMemo(() => {
    if (!report) return false;

    if (report.images.length < MIN_IMAGES) return false;

    // Require at least one selfie image
    if (!report.selfieImages || report.selfieImages.length === 0) return false;

    const checkFields = (fields: (keyof NspResiCumOfficeReportData)[]) => fields.every(field => {
        const value = report[field];
        return value !== null && value !== undefined && value !== '';
    });

    const baseFields: (keyof NspResiCumOfficeReportData)[] = [
        'addressTraceable', 'addressLocatable', 'addressRating', 'resiCumOfficeStatus', 'locality',
        'addressStructure', 'applicantStayingFloor', 'addressStructureColor', 'doorColor',
        'doorNamePlateStatus', 'societyNamePlateStatus', 'landmark1', 'landmark2',
        'dominatedArea', 'otherObservation', 'finalStatus'
    ];

    if (!checkFields(baseFields)) return false;

    // Always available TPC validations (regardless of office status)
    if (report.tpcMetPerson1) {
        if (!report.tpcName1 || report.tpcName1.trim() === '') return false;
    }
    if (report.tpcMetPerson2) {
        if (!report.tpcName2 || report.tpcName2.trim() === '') return false;
    }

    // Conditional validation based on office status
    if (report.resiCumOfficeStatus === ResiCumOfficeStatus.Open) {
        const openedOnlyFields: (keyof NspResiCumOfficeReportData)[] = [
            'metPerson', 'metPersonStatus', 'stayingPeriod'
        ];
        if (!checkFields(openedOnlyFields)) return false;
    }
    if (report.resiCumOfficeStatus === ResiCumOfficeStatus.Closed) {
        if (!report.stayingPersonName || report.stayingPersonName.trim() === '') return false;
    }
    
    if (report.doorNamePlateStatus === SightStatus.Sighted) {
        if (!report.nameOnDoorPlate || report.nameOnDoorPlate.trim() === '') return false;
    }
    if (report.societyNamePlateStatus === SightStatus.Sighted) {
        if (!report.nameOnSocietyBoard || report.nameOnSocietyBoard.trim() === '') return false;
    }
    if (report.finalStatus === FinalStatus.Hold) {
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

    const updates: Partial<NspResiCumOfficeReportData> = { [name]: processedValue };
    updateNspResiCumOfficeReport(caseData.id, updates);
  };

  const handleImagesChange = (images: CapturedImage[]) => {
    updateNspResiCumOfficeReport(caseData.id, { images });
  };

  const handleSelfieImagesChange = (selfieImages: CapturedImage[]) => {
    updateNspResiCumOfficeReport(caseData.id, { selfieImages });
  };
  
  const options = useMemo(() => ({
    addressTraceable: getEnumOptions(AddressTraceable),
    addressLocatable: getEnumOptions(AddressLocatable),
    addressRating: getEnumOptions(AddressRating),
    resiCumOfficeStatus: getEnumOptions(ResiCumOfficeStatus),
    metPersonStatus: getEnumOptions(MetPersonStatusShifted),
    tpcMetPerson: getEnumOptions(TPCMetPerson),
    localityType: getEnumOptions(LocalityTypeResiCumOffice),
    sightStatus: getEnumOptions(SightStatus),
    dominatedArea: getEnumOptions(DominatedArea),
    finalStatus: getEnumOptions(FinalStatus),
  }), []);

  return (
    <AutoSaveFormWrapper
      caseId={caseData.id}
      formType={FORM_TYPES.RESIDENCE_CUM_OFFICE_NSP}
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
      <h3 className="text-lg font-semibold text-brand-primary">NSP Residence-cum-Office Report</h3>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Address Traceable" id="addressTraceable" name="addressTraceable" value={report.addressTraceable || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.addressTraceable}
          </SelectField>
          <SelectField label="Address Locatable" id="addressLocatable" name="addressLocatable" value={report.addressLocatable || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.addressLocatable}
          </SelectField>
          <SelectField label="Address Rating" id="addressRating" name="addressRating" value={report.addressRating || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.addressRating}
          </SelectField>
          <SelectField label="Resi-cum-Office Status" id="resiCumOfficeStatus" name="resiCumOfficeStatus" value={report.resiCumOfficeStatus || ''} onChange={handleChange} disabled={isReadOnly}>
            <option value="">Select...</option>
            {options.resiCumOfficeStatus}
          </SelectField>
        </div>
      </div>

      {/* Always Visible Third Party Confirmation Section */}
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
        <h4 className="font-semibold text-brand-primary">Third Party Confirmation</h4>
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

      {/* Conditional Fields - Only show if office is open */}
      {report.resiCumOfficeStatus === ResiCumOfficeStatus.Open && (
        <div className="p-4 bg-yellow-900/20 rounded-lg space-y-4 border border-yellow-600/30">
          <h4 className="font-semibold text-yellow-400">Additional Details (Office Open)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Met Person" id="metPerson" name="metPerson" value={report.metPerson} onChange={handleChange} disabled={isReadOnly} />
            <SelectField label="Met Person Status" id="metPersonStatus" name="metPersonStatus" value={report.metPersonStatus || ''} onChange={handleChange} disabled={isReadOnly}>
              <option value="">Select...</option>
              {options.metPersonStatus}
            </SelectField>
            <FormField label="Staying Period" id="stayingPeriod" name="stayingPeriod" value={report.stayingPeriod} onChange={handleChange} placeholder="e.g., 2 years" disabled={isReadOnly} />
          </div>
        </div>
      )}

      {/* Staying Person Details Section - Only show if office is closed */}
      {report.resiCumOfficeStatus === ResiCumOfficeStatus.Closed && (
        <div className="p-4 bg-yellow-900/20 rounded-lg space-y-4 border border-yellow-600/30">
          <h4 className="font-semibold text-yellow-400">Confirmation Details (Office Closed)</h4>
          <FormField label="Staying Person Name" id="stayingPersonName" name="stayingPersonName" value={report.stayingPersonName} onChange={handleChange} disabled={isReadOnly} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberDropdownField label="Address Structure" id="addressStructure" name="addressStructure" value={report.addressStructure || ''} onChange={handleChange} min={1} max={150} disabled={isReadOnly} />
        <NumberDropdownField label="Applicant Staying Floor" id="applicantStayingFloor" name="applicantStayingFloor" value={report.applicantStayingFloor || ''} onChange={handleChange} min={1} max={150} disabled={isReadOnly} />
        <FormField label="Address Structure Color" id="addressStructureColor" name="addressStructureColor" value={report.addressStructureColor} onChange={handleChange} disabled={isReadOnly} />
        <FormField label="Door Color" id="doorColor" name="doorColor" value={report.doorColor} onChange={handleChange} disabled={isReadOnly} />
        <SelectField label="Locality" id="locality" name="locality" value={report.locality || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.localityType}</SelectField>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField label="Door Name Plate" id="doorNamePlateStatus" name="doorNamePlateStatus" value={report.doorNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.sightStatus}</SelectField>
        {report.doorNamePlateStatus === SightStatus.Sighted && <FormField label="Name on Door Plate" id="nameOnDoorPlate" name="nameOnDoorPlate" value={report.nameOnDoorPlate} onChange={handleChange} disabled={isReadOnly} />}

        <SelectField label="Society Name Plate" id="societyNamePlateStatus" name="societyNamePlateStatus" value={report.societyNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.sightStatus}</SelectField>
        {report.societyNamePlateStatus === SightStatus.Sighted && <FormField label="Name on Society Board" id="nameOnSocietyBoard" name="nameOnSocietyBoard" value={report.nameOnSocietyBoard} onChange={handleChange} disabled={isReadOnly} />}
      </div>
      
      <FormField label="Landmark 1" id="landmark1" name="landmark1" value={report.landmark1} onChange={handleChange} disabled={isReadOnly} />
      <FormField label="Landmark 2" id="landmark2" name="landmark2" value={report.landmark2} onChange={handleChange} disabled={isReadOnly} />
      
      <SelectField label="Dominated Area" id="dominatedArea" name="dominatedArea" value={report.dominatedArea || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.dominatedArea}</SelectField>
      <TextAreaField label="Other Observation" id="otherObservation" name="otherObservation" value={report.otherObservation} onChange={handleChange} disabled={isReadOnly} />
      
      <SelectField label="Final Status" id="finalStatus" name="finalStatus" value={report.finalStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.finalStatus}</SelectField>
      {report.finalStatus === FinalStatus.Hold && <FormField label="Reason for Hold" id="holdReason" name="holdReason" value={report.holdReason} onChange={handleChange} disabled={isReadOnly} />}
      
      <ImageCapture
        images={report.images}
        onImagesChange={handleImagesChange}
        isReadOnly={isReadOnly}
        minImages={MIN_IMAGES}
        compact={true}
      />

      {/* Selfie Capture Section */}
      <SelfieCapture
        images={report.selfieImages || []}
        onImagesChange={handleSelfieImagesChange}
        isReadOnly={isReadOnly}
        required={true}
        title="🤳 Verification Selfie (Required)"
        compact={true}
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

export default NspResiCumOfficeForm;