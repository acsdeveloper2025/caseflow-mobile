import React, { useMemo, useState } from 'react';
import {
  Case, ResidenceReportData, AddressLocatable, AddressRating, HouseStatus, Relation, WorkingStatus,
  StayingStatus, DocumentShownStatus, DocumentType, TPCMetPerson, TPCConfirmation, LocalityType,
  SightStatus, PoliticalConnection, DominatedArea, FeedbackFromNeighbour, FinalStatus, CaseStatus, CapturedImage
} from '../../../types';
import { useCases } from '../../../context/CaseContext';
import { FormField, SelectField, TextAreaField } from '../../FormControls';
import ConfirmationModal from '../../ConfirmationModal';
import ImageCapture from '../../ImageCapture';

interface ResidenceFormProps {
  caseData: Case;
}

// Helper to create <option> elements from an enum
const getEnumOptions = (enumObject: object) => Object.values(enumObject).map(value => (
  <option key={value} value={value}>{value}</option>
));

const calculateAge = (dob: string): number | null => {
    if (!dob) return null;
    try {
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : null;
    } catch (e) {
        return null;
    }
};

const ResidenceForm: React.FC<ResidenceFormProps> = ({ caseData }) => {
  const { updateResidenceReport, updateCaseStatus, toggleSaveCase } = useCases();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const report = caseData.residenceReport;
  const isReadOnly = caseData.status === CaseStatus.Completed || caseData.isSaved;
  const MIN_IMAGES = 5;

  if (!report) {
    return <p className="text-medium-text">No residence report data available for this case.</p>;
  }

  const isFormValid = useMemo(() => {
    if (!report) return false;
    
    const checkFields = (fields: (keyof ResidenceReportData)[]) => fields.every(field => {
      const value = report[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    if (report.images.length < MIN_IMAGES) return false;

    const baseFields: (keyof ResidenceReportData)[] = [
        'addressLocatable', 'addressRating', 'houseStatus',
        'stayingPeriod', 'stayingStatus', 'approxArea', 'documentShownStatus',
        'tpcMetPerson1', 'tpcName1', 'tpcConfirmation1', 'tpcMetPerson2', 'tpcName2', 'tpcConfirmation1',
        'locality', 'addressStructure', 'applicantStayingFloor', 'addressStructureColor', 'doorColor',
        'doorNamePlateStatus', 'societyNamePlateStatus', 'landmark1', 'landmark2',
        'politicalConnection', 'dominatedArea', 'feedbackFromNeighbour', 'otherObservation', 'finalStatus'
    ];

    if (!checkFields(baseFields)) return false;

    if (report.houseStatus === HouseStatus.Opened) {
        const openedFields: (keyof ResidenceReportData)[] = [
            'metPersonName', 'metPersonRelation', 'totalFamilyMembers', 'totalEarning',
            'applicantDob', 'workingStatus'
        ];
        if (!checkFields(openedFields)) return false;
        if (report.workingStatus !== WorkingStatus.HouseWife) {
            if (!report.companyName || report.companyName.trim() === '') return false;
        }
    }
    
    if (report.documentShownStatus === DocumentShownStatus.Showed) {
        if (!report.documentType) return false;
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
    const { name, value, type } = e.target;
    let processedValue: string | number | null = value;

    if (type === 'number') {
      processedValue = value === '' ? null : Number(value);
    }
    
    if (e.target.tagName === 'SELECT' && value === '') {
        processedValue = null;
    }

    const updates: Partial<ResidenceReportData> = { [name]: processedValue };
    
    if (name === 'applicantDob') {
        updates.applicantAge = calculateAge(value);
    }
    
    updateResidenceReport(caseData.id, updates);
  };
  
  const handleImagesChange = (images: CapturedImage[]) => {
    updateResidenceReport(caseData.id, { images });
  };

  const options = useMemo(() => ({
    addressLocatable: getEnumOptions(AddressLocatable),
    addressRating: getEnumOptions(AddressRating),
    houseStatus: getEnumOptions(HouseStatus),
    relation: getEnumOptions(Relation),
    workingStatus: getEnumOptions(WorkingStatus),
    stayingStatus: getEnumOptions(StayingStatus),
    documentShownStatus: getEnumOptions(DocumentShownStatus),
    documentType: getEnumOptions(DocumentType),
    tpcMetPerson: getEnumOptions(TPCMetPerson),
    tpcConfirmation: getEnumOptions(TPCConfirmation),
    localityType: getEnumOptions(LocalityType),
    sightStatus: getEnumOptions(SightStatus),
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
        <SelectField label="House Status" id="houseStatus" name="houseStatus" value={report.houseStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.houseStatus}</SelectField>
      </div>

      {report.houseStatus === HouseStatus.Opened && (
        <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
            <h5 className="font-semibold text-brand-primary">Met Person Details (Opened House)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Met Person Name" id="metPersonName" name="metPersonName" value={report.metPersonName} onChange={handleChange} disabled={isReadOnly} />
              <SelectField label="Relation" id="metPersonRelation" name="metPersonRelation" value={report.metPersonRelation || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.relation}</SelectField>
              <FormField label="Total Family Members" id="totalFamilyMembers" name="totalFamilyMembers" value={report.totalFamilyMembers || ''} onChange={handleChange} type="number" disabled={isReadOnly} />
              <FormField label="Total Earning" id="totalEarning" name="totalEarning" value={report.totalEarning || ''} onChange={handleChange} type="number" placeholder="e.g., 50000" disabled={isReadOnly} />
              <FormField label="Applicant DOB" id="applicantDob" name="applicantDob" value={report.applicantDob} onChange={handleChange} type="date" disabled={isReadOnly} />
              <FormField label="Applicant Age" id="applicantAge" name="applicantAge" value={report.applicantAge || ''} onChange={() => {}} disabled />
              <SelectField label="Working Status" id="workingStatus" name="workingStatus" value={report.workingStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.workingStatus}</SelectField>
              {report.workingStatus !== WorkingStatus.HouseWife && <FormField label="Company Name" id="companyName" name="companyName" value={report.companyName} onChange={handleChange} disabled={isReadOnly} />}
              <FormField label="Staying Period" id="stayingPeriod" name="stayingPeriod" value={report.stayingPeriod} onChange={handleChange} placeholder="e.g., 5 years 3 months" disabled={isReadOnly} />
              <SelectField label="Staying Status" id="stayingStatus" name="stayingStatus" value={report.stayingStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.stayingStatus}</SelectField>
              <FormField label="Approx Area (Sq. Feet)" id="approxArea" name="approxArea" value={report.approxArea || ''} onChange={handleChange} type="number" disabled={isReadOnly} />
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField label="Document Shown Status" id="documentShownStatus" name="documentShownStatus" value={report.documentShownStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.documentShownStatus}</SelectField>
        {report.documentShownStatus === DocumentShownStatus.Showed && <SelectField label="Document Type" id="documentType" name="documentType" value={report.documentType || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.documentType}</SelectField>}
      </div>

      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
          <h5 className="font-semibold text-brand-primary">Third Party Confirmation 1</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="TPC Met Person" id="tpcMetPerson1" name="tpcMetPerson1" value={report.tpcMetPerson1 || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.tpcMetPerson}</SelectField>
            <FormField label="Name of TPC" id="tpcName1" name="tpcName1" value={report.tpcName1} onChange={handleChange} disabled={isReadOnly} />
            <SelectField label="Confirmation" id="tpcConfirmation1" name="tpcConfirmation1" value={report.tpcConfirmation1 || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.tpcConfirmation}</SelectField>
          </div>
      </div>
      
      <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-dark-border">
          <h5 className="font-semibold text-brand-primary">Third Party Confirmation 2</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField label="TPC Met Person" id="tpcMetPerson2" name="tpcMetPerson2" value={report.tpcMetPerson2 || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.tpcMetPerson}</SelectField>
            <FormField label="Name of TPC" id="tpcName2" name="tpcName2" value={report.tpcName2} onChange={handleChange} disabled={isReadOnly} />
            <SelectField label="Confirmation" id="tpcConfirmation2" name="tpcConfirmation2" value={report.tpcConfirmation2 || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.tpcConfirmation}</SelectField>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField label="Locality" id="locality" name="locality" value={report.locality || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.localityType}</SelectField>
        <FormField label="Address Structure" id="addressStructure" name="addressStructure" value={report.addressStructure} onChange={handleChange} placeholder="e.g., G+7" disabled={isReadOnly} />
        <FormField label="Applicant Staying Floor" id="applicantStayingFloor" name="applicantStayingFloor" value={report.applicantStayingFloor} onChange={handleChange} placeholder="e.g., 4" disabled={isReadOnly} />
        <FormField label="Address Structure Color" id="addressStructureColor" name="addressStructureColor" value={report.addressStructureColor} onChange={handleChange} disabled={isReadOnly} />
        <FormField label="Door Color" id="doorColor" name="doorColor" value={report.doorColor} onChange={handleChange} disabled={isReadOnly} />

        <SelectField label="Door Name Plate" id="doorNamePlateStatus" name="doorNamePlateStatus" value={report.doorNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.sightStatus}</SelectField>
        {report.doorNamePlateStatus === SightStatus.Sighted && <FormField label="Name on Door Plate" id="nameOnDoorPlate" name="nameOnDoorPlate" value={report.nameOnDoorPlate} onChange={handleChange} disabled={isReadOnly} />}

        <SelectField label="Society Name Plate" id="societyNamePlateStatus" name="societyNamePlateStatus" value={report.societyNamePlateStatus || ''} onChange={handleChange} disabled={isReadOnly}><option value="">Select...</option>{options.sightStatus}</SelectField>
        {report.societyNamePlateStatus === SightStatus.Sighted && <FormField label="Name on Society Board" id="nameOnSocietyBoard" name="nameOnSocietyBoard" value={report.nameOnSocietyBoard} onChange={handleChange} disabled={isReadOnly} />}

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

export default ResidenceForm;