import React, { useMemo, useState } from 'react';
import {
  Case, ShiftedDsaReportData, AddressLocatable, AddressRating, OfficeStatusOffice, DesignationShiftedOffice,
  PremisesStatusBusiness, SightStatus, TPCMetPerson, TPCConfirmation, LocalityTypeResiCumOffice, PoliticalConnection,
  DominatedArea, FeedbackFromNeighbour, FinalStatusShiftedBusiness, CaseStatus, CapturedImage
} from '../../../types';
import { useCases } from '../../../context/CaseContext';
import { FormField, SelectField, TextAreaField } from '../../FormControls';
import ConfirmationModal from '../../ConfirmationModal';
import ImageCapture from '../../ImageCapture';

interface ShiftedDsaFormProps {
  caseData: Case;
}

const getEnumOptions = (enumObject: object) => Object.values(enumObject).map(value => (
  <option key={value} value={value}>{value}</option>
));

const ShiftedDsaForm: React.FC<ShiftedDsaFormProps> = ({ caseData }) => {
  const { updateShiftedDsaReport, updateCaseStatus, toggleSaveCase } = useCases();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const report = caseData.shiftedDsaReport;
  const isReadOnly = caseData.status === CaseStatus.Completed || caseData.isSaved;
  const MIN_IMAGES = 5;

  if (!report) {
    return <p className="text-medium-text">No Shifted DSA/DST report data available.</p>;
  }

  const isFormValid = useMemo(() => {
    if (!report) return false;

    if (report.images.length < MIN_IMAGES) return false;

    const checkFields = (fields: (keyof ShiftedDsaReportData)[]) => fields.every(field => {
        const value = report[field];
        return value !== null && value !== undefined && value !== '';
    });

    const baseFields: (keyof ShiftedDsaReportData)[] = [
        'addressLocatable', 'addressRating', 'officeStatus', 'locality', 'addressStructure', 'addressStructureColor',
        'doorColor', 'landmark1', 'landmark2', 'politicalConnection', 'dominatedArea', 'feedbackFromNeighbour',
        'otherObservation', 'finalStatus'
    ];
    if (!checkFields(baseFields)) return false;

    if (report.officeStatus === OfficeStatusOffice.Opened) {
        const openedFields: (keyof ShiftedDsaReportData)[] = [
            'metPerson', 'designation', 'premisesStatus', 'oldOfficeShiftedPeriod', 'approxArea',
            'tpcMetPerson', 'nameOfTpc', 'tpcConfirmation1', 'tpcMetPerson2', 'nameOfTpc2', 'tpcConfirmation2',
            'companyNamePlateStatus'
        ];
        if (!checkFields(openedFields)) return false;

        if (report.premisesStatus !== PremisesStatusBusiness.Vacant) {
            if (!report.currentCompanyName || !report.currentCompanyPeriod) return false;
        }

        if (report.companyNamePlateStatus === SightStatus.Sighted) {
            if (!report.nameOnBoard || report.nameOnBoard.trim() === '') return false;
        }
    }

    if (report.finalStatus === FinalStatusShiftedBusiness.Hold) {
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

    const updates: Partial<ShiftedDsaReportData> = { [name]: processedValue };
    updateShiftedDsaReport(caseData.id, updates);
  };
  
  const handleImagesChange = (images: CapturedImage[]) => {
    updateShiftedDsaReport(caseData.id, { images });
  };

  const options = useMemo(() => ({
    addressLocatable: getEnumOptions(AddressLocatable),
    addressRating: getEnumOptions(AddressRating),
    officeStatus: getEnumOptions(OfficeStatusOffice),
    designation: getEnumOptions(DesignationShiftedOffice),
    premisesStatus: getEnumOptions(PremisesStatusBusiness),
    sightStatus: getEnumOptions(SightStatus),
    tpcMetPerson: getEnumOptions(TPCMetPerson),
    tpcConfirmation: getEnumOptions(TPCConfirmation),
    localityType: getEnumOptions(LocalityTypeResiCumOffice),
    politicalConnection: getEnumOptions(PoliticalConnection),
    dominatedArea: getEnumOptions(DominatedArea),
    feedbackFromNeighbour: getEnumOptions(FeedbackFromNeighbour),
    finalStatus: getEnumOptions(FinalStatusShiftedBusiness),
  }), []);

  return (
    <div className="space-y-4 pt-4 border-t border-dark-border">
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
            <SelectField label="Premises Status" id="premisesStatus" name="premisesStatus" value={report.premisesStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.premisesStatus}</SelectField>
            
            {report.premisesStatus !== PremisesStatusBusiness.Vacant && (
              <>
                <FormField label="Current Company Name" id="currentCompanyName" name="currentCompanyName" value={report.currentCompanyName} onChange={handleChange} disabled={isReadOnly} />
                <FormField label="Current Company Period" id="currentCompanyPeriod" name="currentCompanyPeriod" value={report.currentCompanyPeriod} onChange={handleChange} placeholder="e.g., 2 years" disabled={isReadOnly} />
              </>
            )}

            <FormField label="Old Office Shifted Period" id="oldOfficeShiftedPeriod" name="oldOfficeShiftedPeriod" value={report.oldOfficeShiftedPeriod} onChange={handleChange} placeholder="e.g., 6 months ago" disabled={isReadOnly} />
            <FormField label="Approx Area (Sq. Feet)" id="approxArea" name="approxArea" value={report.approxArea || ''} onChange={handleChange} type="number" disabled={isReadOnly} />
            
            <SelectField label="Company Name Plate" id="companyNamePlateStatus" name="companyNamePlateStatus" value={report.companyNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.sightStatus}</SelectField>
            {report.companyNamePlateStatus === SightStatus.Sighted && <FormField label="Name on Board" id="nameOnBoard" name="nameOnBoard" value={report.nameOnBoard} onChange={handleChange} disabled={isReadOnly} />}
          </div>

          <div className="pt-4 mt-4 border-t border-dark-border">
            <h5 className="font-semibold text-brand-primary">Third Party Confirmation 1</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <SelectField label="TPC Met Person" id="tpcMetPerson" name="tpcMetPerson" value={report.tpcMetPerson || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.tpcMetPerson}</SelectField>
              <FormField label="Name of TPC" id="nameOfTpc" name="nameOfTpc" value={report.nameOfTpc} onChange={handleChange} disabled={isReadOnly} />
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
      {report.finalStatus === FinalStatusShiftedBusiness.Hold && <FormField label="Reason for Hold" id="holdReason" name="holdReason" value={report.holdReason} onChange={handleChange} disabled={isReadOnly} />}

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

export default ShiftedDsaForm;