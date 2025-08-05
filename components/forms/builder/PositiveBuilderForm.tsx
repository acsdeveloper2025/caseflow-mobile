import React, { useMemo, useState } from 'react';
import {
  Case, PositiveBuilderReportData, AddressLocatable, AddressRating, OfficeStatusOffice, DesignationShiftedOffice,
  BusinessType, OwnershipTypeBusiness, AddressStatusBusiness, SightStatus, TPCMetPerson, TPCConfirmation,
  LocalityTypeResiCumOffice, PoliticalConnection, DominatedArea, FeedbackFromNeighbour, FinalStatus, CaseStatus, CapturedImage
} from '../../../types';
import { useCases } from '../../../context/CaseContext';
import { FormField, SelectField, TextAreaField } from '../../FormControls';
import ConfirmationModal from '../../ConfirmationModal';
import ImageCapture from '../../ImageCapture';

interface PositiveBuilderFormProps {
  caseData: Case;
}

const getEnumOptions = (enumObject: object) => Object.values(enumObject).map(value => (
  <option key={value} value={value}>{value}</option>
));

const PositiveBuilderForm: React.FC<PositiveBuilderFormProps> = ({ caseData }) => {
  const { updatePositiveBuilderReport, updateCaseStatus, toggleSaveCase } = useCases();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const report = caseData.positiveBuilderReport;
  const isReadOnly = caseData.status === CaseStatus.Completed || caseData.isSaved;
  const MIN_IMAGES = 5;

  if (!report) {
    return <p className="text-medium-text">No Positive Builder report data available.</p>;
  }

  const isFormValid = useMemo(() => {
    if (!report) return false;
    
    if (report.images.length < MIN_IMAGES) return false;

    const checkFields = (fields: (keyof PositiveBuilderReportData)[]) => fields.every(field => {
        const value = report[field];
        return value !== null && value !== undefined && value !== '';
    });

    const baseFields: (keyof PositiveBuilderReportData)[] = [
        'addressLocatable', 'addressRating', 'officeStatus', 'locality', 'addressStructure', 'addressStructureColor',
        'doorColor', 'landmark1', 'landmark2', 'politicalConnection', 'dominatedArea', 'feedbackFromNeighbour',
        'otherObservation', 'finalStatus'
    ];
    if (!checkFields(baseFields)) return false;

    if (report.officeStatus === OfficeStatusOffice.Opened) {
        const openedFields: (keyof PositiveBuilderReportData)[] = [
            'metPerson', 'designation', 'businessType', 'nameOfCompanyOwners', 'ownershipType', 'addressStatus',
            'companyNatureOfBusiness', 'businessPeriod', 'officeApproxArea', 'staffStrength', 'staffSeen',
            'companyNamePlateStatus', 'documentShown', 'tpcMetPerson1', 'nameOfTpc1', 'tpcConfirmation1',
            'tpcMetPerson2', 'nameOfTpc2', 'tpcConfirmation2'
        ];
        if (!checkFields(openedFields)) return false;
        if (report.companyNamePlateStatus === SightStatus.Sighted) {
            if (!report.nameOnBoard || report.nameOnBoard.trim() === '') return false;
        }
    }

    if (report.finalStatus === FinalStatus.Hold) {
        if (!report.holdReason || report.holdReason.trim() === '') return false;
    }

    return true;
  }, [report]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | null = value;

    if (type === 'number') {
      processedValue = value === '' ? null : Number(value);
    }
    
    if (e.target.tagName === 'SELECT' && value === '') {
        processedValue = null;
    }

    const updates: Partial<PositiveBuilderReportData> = { [name]: processedValue };
    updatePositiveBuilderReport(caseData.id, updates);
  };
  
  const handleImagesChange = (images: CapturedImage[]) => {
    updatePositiveBuilderReport(caseData.id, { images });
  };

  const options = useMemo(() => ({
    addressLocatable: getEnumOptions(AddressLocatable),
    addressRating: getEnumOptions(AddressRating),
    officeStatus: getEnumOptions(OfficeStatusOffice),
    designation: getEnumOptions(DesignationShiftedOffice),
    businessType: getEnumOptions(BusinessType),
    ownershipType: getEnumOptions(OwnershipTypeBusiness),
    addressStatus: getEnumOptions(AddressStatusBusiness),
    sightStatus: getEnumOptions(SightStatus),
    tpcMetPerson: getEnumOptions(TPCMetPerson),
    tpcConfirmation: getEnumOptions(TPCConfirmation),
    localityType: getEnumOptions(LocalityTypeResiCumOffice),
    politicalConnection: getEnumOptions(PoliticalConnection),
    dominatedArea: getEnumOptions(DominatedArea),
    feedbackFromNeighbour: getEnumOptions(FeedbackFromNeighbour),
    finalStatus: getEnumOptions(FinalStatus),
  }), []);

  return (
    <div className="space-y-4 pt-4 border-t border-dark-border">
        <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border mb-4">
            <h5 className="font-semibold text-brand-primary">Case Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Customer Name" id="case-customerName" name="case-customerName" value={caseData.customer.name} onChange={() => {}} disabled />
                <FormField label="Bank Name" id="case-bankName" name="case-bankName" value={caseData.bankName || ''} onChange={() => {}} disabled />
                <FormField label="Product" id="case-product" name="case-product" value={caseData.product || ''} onChange={() => {}} disabled />
                <FormField label="Trigger" id="case-trigger" name="case-trigger" value={caseData.trigger || ''} onChange={() => {}} disabled />
                <div className="md:col-span-2">
                <FormField label="Visit Address" id="case-visitAddress" name="case-visitAddress" value={caseData.visitAddress || ''} onChange={() => {}} disabled />
                </div>
                <FormField label="System Contact Number" id="case-systemContactNumber" name="case-systemContactNumber" value={caseData.systemContactNumber || ''} onChange={() => {}} disabled />
                <FormField label="Customer Calling Code" id="case-customerCallingCode" name="case-customerCallingCode" value={caseData.customerCallingCode || ''} onChange={() => {}} disabled />
                <FormField label="Applicant Status" id="case-applicantStatus" name="case-applicantStatus" value={caseData.applicantStatus || ''} onChange={() => {}} disabled />
            </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField label="Address Locatable" id="addressLocatable" name="addressLocatable" value={report.addressLocatable || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.addressLocatable}</SelectField>
        <SelectField label="Address Rating" id="addressRating" name="addressRating" value={report.addressRating || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.addressRating}</SelectField>
        <SelectField label="Office Status" id="officeStatus" name="officeStatus" value={report.officeStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.officeStatus}</SelectField>
      </div>

      {report.officeStatus === OfficeStatusOffice.Opened && (
        <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
          <h5 className="font-semibold text-brand-primary">Verification Details (Office Open)</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Met Person" id="metPerson" name="metPerson" value={report.metPerson} onChange={handleChange} disabled={isReadOnly} />
            <SelectField label="Designation" id="designation" name="designation" value={report.designation || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.designation}</SelectField>
            <SelectField label="Business Type" id="businessType" name="businessType" value={report.businessType || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.businessType}</SelectField>
            <FormField label="Name of Company Owners" id="nameOfCompanyOwners" name="nameOfCompanyOwners" value={report.nameOfCompanyOwners} onChange={handleChange} disabled={isReadOnly} />
            <SelectField label="Ownership Type" id="ownershipType" name="ownershipType" value={report.ownershipType || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.ownershipType}</SelectField>
            <SelectField label="Address Status" id="addressStatus" name="addressStatus" value={report.addressStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.addressStatus}</SelectField>
            <FormField label="Company Nature of Business" id="companyNatureOfBusiness" name="companyNatureOfBusiness" value={report.companyNatureOfBusiness} onChange={handleChange} disabled={isReadOnly} />
            <FormField label="Business Period" id="businessPeriod" name="businessPeriod" value={report.businessPeriod} onChange={handleChange} placeholder="e.g., 5 years" disabled={isReadOnly} />
            <FormField label="Office Approx Area (Sq. Feet)" id="officeApproxArea" name="officeApproxArea" value={report.officeApproxArea || ''} onChange={handleChange} type="number" disabled={isReadOnly} />
            <FormField label="Staff Strength" id="staffStrength" name="staffStrength" value={report.staffStrength || ''} onChange={handleChange} type="number" disabled={isReadOnly} />
            <FormField label="Staff Seen" id="staffSeen" name="staffSeen" value={report.staffSeen || ''} onChange={handleChange} type="number" disabled={isReadOnly} />
            <SelectField label="Company Name Plate" id="companyNamePlateStatus" name="companyNamePlateStatus" value={report.companyNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.sightStatus}</SelectField>
            {report.companyNamePlateStatus === SightStatus.Sighted && <FormField label="Name on Board" id="nameOnBoard" name="nameOnBoard" value={report.nameOnBoard} onChange={handleChange} disabled={isReadOnly} />}
            <FormField label="Document Shown" id="documentShown" name="documentShown" value={report.documentShown} onChange={handleChange} placeholder="e.g., Gumasta, Rent Deed" disabled={isReadOnly} />
          </div>

          <div className="pt-4 mt-4 border-t border-dark-border">
            <h5 className="font-semibold text-brand-primary">Third Party Confirmation 1</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <SelectField label="TPC Met Person" id="tpcMetPerson1" name="tpcMetPerson1" value={report.tpcMetPerson1 || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.tpcMetPerson}</SelectField>
              <FormField label="Name of TPC" id="nameOfTpc1" name="nameOfTpc1" value={report.nameOfTpc1} onChange={handleChange} disabled={isReadOnly} />
              <SelectField label="Confirmation" id="tpcConfirmation1" name="tpcConfirmation1" value={report.tpcConfirmation1 || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.tpcConfirmation}</SelectField>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-dark-border">
            <h5 className="font-semibold text-brand-primary">Third Party Confirmation 2</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <SelectField label="TPC Met Person" id="tpcMetPerson2" name="tpcMetPerson2" value={report.tpcMetPerson2 || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.tpcMetPerson}</SelectField>
              <FormField label="Name of TPC" id="nameOfTpc2" name="nameOfTpc2" value={report.nameOfTpc2} onChange={handleChange} disabled={isReadOnly} />
              <SelectField label="Confirmation" id="tpcConfirmation2" name="tpcConfirmation2" value={report.tpcConfirmation2 || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.tpcConfirmation}</SelectField>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField label="Locality" id="locality" name="locality" value={report.locality || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.localityType}</SelectField>
        <FormField label="Address Structure" id="addressStructure" name="addressStructure" value={report.addressStructure} onChange={handleChange} disabled={isReadOnly} />
        <FormField label="Address Structure Color" id="addressStructureColor" name="addressStructureColor" value={report.addressStructureColor} onChange={handleChange} disabled={isReadOnly} />
        <FormField label="Door Color" id="doorColor" name="doorColor" value={report.doorColor} onChange={handleChange} disabled={isReadOnly} />
        <SelectField label="Political Connection" id="politicalConnection" name="politicalConnection" value={report.politicalConnection || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.politicalConnection}</SelectField>
        <SelectField label="Dominated Area" id="dominatedArea" name="dominatedArea" value={report.dominatedArea || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.dominatedArea}</SelectField>
        <SelectField label="Feedback from Neighbour" id="feedbackFromNeighbour" name="feedbackFromNeighbour" value={report.feedbackFromNeighbour || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.feedbackFromNeighbour}</SelectField>
      </div>
      
      <FormField label="Landmark 1" id="landmark1" name="landmark1" value={report.landmark1} onChange={handleChange} disabled={isReadOnly} />
      <FormField label="Landmark 2" id="landmark2" name="landmark2" value={report.landmark2} onChange={handleChange} disabled={isReadOnly} />
      <TextAreaField label="Other Observation" id="otherObservation" name="otherObservation" value={report.otherObservation} onChange={handleChange} disabled={isReadOnly} />
      
      <SelectField label="Final Status" id="finalStatus" name="finalStatus" value={report.finalStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.finalStatus}</SelectField>
      {report.finalStatus === FinalStatus.Hold && <FormField label="Reason for Hold" id="holdReason" name="holdReason" value={report.holdReason} onChange={handleChange} disabled={isReadOnly} />}

      <ImageCapture
        images={report.images}
        onImagesChange={handleImagesChange}
        isReadOnly={isReadOnly}
        minImages={MIN_IMAGES}
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

export default PositiveBuilderForm;