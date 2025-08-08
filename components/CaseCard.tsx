import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Case, CaseStatus, VerificationType, VerificationOutcome, RevokeReason } from '../types';
import { useCases } from '../context/CaseContext';
import { summarizeReport } from '../services/geminiService';
import { SparklesIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon, XIcon, InfoIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';
import Spinner from './Spinner';
import Modal from './Modal';
import { useCaseAutoSaveStatus } from '../hooks/useCaseAutoSaveStatus';
import PositiveResidenceForm from './forms/residence/PositiveResidenceForm';
import ShiftedResidenceForm from './forms/residence/ShiftedResidenceForm';
import NspResidenceForm from './forms/residence/NspResidenceForm';
import EntryRestrictedResidenceForm from './forms/residence/EntryRestrictedResidenceForm';
import UntraceableResidenceForm from './forms/residence/UntraceableResidenceForm';
import PositiveResiCumOfficeForm from './forms/residence-cum-office/PositiveResiCumOfficeForm';
import ShiftedResiCumOfficeForm from './forms/residence-cum-office/ShiftedResiCumOfficeForm';
import NspResiCumOfficeForm from './forms/residence-cum-office/NspResiCumOfficeForm';
import EntryRestrictedResiCumOfficeForm from './forms/residence-cum-office/EntryRestrictedResiCumOfficeForm';
import UntraceableResiCumOfficeForm from './forms/residence-cum-office/UntraceableResiCumOfficeForm';
import PositiveOfficeForm from './forms/office/PositiveOfficeForm';
import ShiftedOfficeForm from './forms/office/ShiftedOfficeForm';
import NspOfficeForm from './forms/office/NspOfficeForm';
import EntryRestrictedOfficeForm from './forms/office/EntryRestrictedOfficeForm';
import UntraceableOfficeForm from './forms/office/UntraceableOfficeForm';
import PositiveBusinessForm from './forms/business/PositiveBusinessForm';
import ShiftedBusinessForm from './forms/business/ShiftedBusinessForm';
import NspBusinessForm from './forms/business/NspBusinessForm';
import EntryRestrictedBusinessForm from './forms/business/EntryRestrictedBusinessForm';
import UntraceableBusinessForm from './forms/business/UntraceableBusinessForm';
import PositiveBuilderForm from './forms/builder/PositiveBuilderForm';
import ShiftedBuilderForm from './forms/builder/ShiftedBuilderForm';
import NspBuilderForm from './forms/builder/NspBuilderForm';
import EntryRestrictedBuilderForm from './forms/builder/EntryRestrictedBuilderForm';
import UntraceableBuilderForm from './forms/builder/UntraceableBuilderForm';
import PositiveNocForm from './forms/noc/PositiveNocForm';
import ShiftedNocForm from './forms/noc/ShiftedNocForm';
import NspNocForm from './forms/noc/NspNocForm';
import EntryRestrictedNocForm from './forms/noc/EntryRestrictedNocForm';
import UntraceableNocForm from './forms/noc/UntraceableNocForm';
import PositiveDsaForm from './forms/dsa-dst-connector/PositiveDsaForm';
import ShiftedDsaForm from './forms/dsa-dst-connector/ShiftedDsaForm';
import NspDsaForm from './forms/dsa-dst-connector/NspDsaForm';
import EntryRestrictedDsaForm from './forms/dsa-dst-connector/EntryRestrictedDsaForm';
import UntraceableDsaForm from './forms/dsa-dst-connector/UntraceableDsaForm';
import PositiveNegativePropertyApfForm from './forms/property-apf/PositiveNegativePropertyApfForm';
import EntryRestrictedPropertyApfForm from './forms/property-apf/EntryRestrictedPropertyApfForm';
import UntraceablePropertyApfForm from './forms/property-apf/UntraceablePropertyApfForm';
import PositivePropertyIndividualForm from './forms/property-individual/PositivePropertyIndividualForm';
import NspPropertyIndividualForm from './forms/property-individual/NspPropertyIndividualForm';
import EntryRestrictedPropertyIndividualForm from './forms/property-individual/EntryRestrictedPropertyIndividualForm';
import UntraceablePropertyIndividualForm from './forms/property-individual/UntraceablePropertyIndividualForm';
import { SelectField } from './FormControls';

interface CaseCardProps {
  caseData: Case;
  isReorderable?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const getEnumOptions = (enumObject: object): React.ReactElement[] => Object.values(enumObject).map(value => (
  <option key={value} value={value}>{value}</option>
));

const commonOutcomes = {
    PositiveAndDoorLocked: VerificationOutcome.PositiveAndDoorLocked,
    ShiftedAndDoorLocked: VerificationOutcome.ShiftedAndDoorLocked,
    NSPAndDoorLocked: VerificationOutcome.NSPAndDoorLocked,
    ERT: VerificationOutcome.ERT,
    Untraceable: VerificationOutcome.Untraceable,
};

const verificationOptionsMap: { [key in VerificationType]?: React.ReactElement[] } = {
    [VerificationType.Residence]: getEnumOptions(commonOutcomes),
    [VerificationType.ResidenceCumOffice]: getEnumOptions(commonOutcomes),
    [VerificationType.Office]: getEnumOptions(commonOutcomes),
    [VerificationType.Business]: getEnumOptions(commonOutcomes),
    [VerificationType.Builder]: getEnumOptions(commonOutcomes),
    [VerificationType.NOC]: getEnumOptions(commonOutcomes),
    [VerificationType.Connector]: getEnumOptions(commonOutcomes),
    [VerificationType.PropertyAPF]: getEnumOptions({
        PositiveAndDoorLocked: VerificationOutcome.PositiveAndDoorLocked,
        ERT: VerificationOutcome.ERT,
        Untraceable: VerificationOutcome.Untraceable,
    }),
    [VerificationType.PropertyIndividual]: getEnumOptions({
        PositiveAndDoorLocked: VerificationOutcome.PositiveAndDoorLocked,
        NSPAndDoorLocked: VerificationOutcome.NSPAndDoorLocked,
        ERT: VerificationOutcome.ERT,
        Untraceable: VerificationOutcome.Untraceable,
    }),
};

const CaseCard: React.FC<CaseCardProps> = ({ caseData, isReorderable = false, isFirst, isLast }) => {
  const { updateCaseStatus, toggleSaveCase, updateVerificationOutcome, revokeCase, reorderInProgressCase } = useCases();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState<RevokeReason>(RevokeReason.NotMyArea);

  // Check for auto-saved data for this case
  const { hasAutoSaveData } = useCaseAutoSaveStatus(caseData.id);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [isSummarizingReport, setIsSummarizingReport] = useState(false);
  const [isFormExpanding, setIsFormExpanding] = useState(false);
  const [isFormScrollable, setIsFormScrollable] = useState(false);
  const formContentRef = useRef<HTMLDivElement>(null);
  
  const isAssigned = caseData.status === CaseStatus.Assigned;
  const isInProgress = caseData.status === CaseStatus.InProgress;
  const isCompletedOrSaved = caseData.status === CaseStatus.Completed || caseData.isSaved;

  const handleSummarizeReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSummarizingReport(true);
    setIsSummaryModalOpen(true);
    setSummaryContent(''); // Clear previous summary
    const result = await summarizeReport(caseData);
    setSummaryContent(result);
    setIsSummarizingReport(false);
  };

  const handleOutcomeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Prevent event bubbling to avoid card collapse
    e.stopPropagation();

    const newOutcome = e.target.value as VerificationOutcome || null;
    updateVerificationOutcome(caseData.id, newOutcome);

    // Automatically expand the card to show the form when an outcome is selected
    if (newOutcome && !isExpanded) {
      setIsFormExpanding(true);
      setIsExpanded(true);

      // Scroll to the form content after a brief delay to allow expansion animation
      setTimeout(() => {
        setIsFormExpanding(false);
        if (formContentRef.current) {
          // Scroll the form container into view
          formContentRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });

          // Reset the form's internal scroll position to top
          formContentRef.current.scrollTop = 0;

          // Check if content is scrollable
          const isScrollable = formContentRef.current.scrollHeight > formContentRef.current.clientHeight;
          setIsFormScrollable(isScrollable);
        }
      }, 300); // Wait for expansion animation to start
    }
  };

  const handleRevokeConfirm = () => {
    if (revokeReason) {
        revokeCase(caseData.id, revokeReason);
        setIsRevokeModalOpen(false);
    }
  };

  const statusColor = {
    [CaseStatus.Assigned]: 'border-l-4 border-blue-500',
    [CaseStatus.InProgress]: 'border-l-4 border-yellow-500',
    [CaseStatus.Completed]: 'border-l-4 border-green-500',
  };
  
  const verificationOutcomeOptions = useMemo(() => verificationOptionsMap[caseData.verificationType], [caseData.verificationType]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimestampInfo = () => {
      if (caseData.isSaved) {
          return { label: 'Saved', value: formatDate(caseData.savedAt) };
      }
      switch (caseData.status) {
          case CaseStatus.Assigned:
              return { label: 'Assigned', value: formatDate(caseData.createdAt) };
          case CaseStatus.InProgress:
              return { label: 'Started', value: formatDate(caseData.inProgressAt) };
          case CaseStatus.Completed:
              return { label: 'Completed', value: formatDate(caseData.completedAt) };
          default:
              return { label: 'Updated', value: formatDate(caseData.updatedAt) };
      }
  };

  const timestamp = getTimestampInfo();

  const renderOutcomeSelectionPrompt = () => (
    <div style={{
      textAlign: 'center',
      padding: '24px 16px',
      margin: '16px 0',
      backgroundColor: '#1F2937',
      borderRadius: '8px',
      border: '2px dashed #374151'
    }}>
      <div style={{ color: '#00a950', marginBottom: '8px', fontSize: '24px' }}>📋</div>
      <p style={{ color: '#F9FAFB', fontWeight: '600', marginBottom: '4px' }}>
        Select Verification Outcome
      </p>
      <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
        Choose an outcome from the dropdown above to automatically open the verification form
      </p>
    </div>
  );

  const renderFormContent = () => {
    if (caseData.verificationType === VerificationType.Residence) {
      switch (caseData.verificationOutcome) {
        case VerificationOutcome.PositiveAndDoorLocked:
          return caseData.residenceReport ? <PositiveResidenceForm caseData={caseData} /> : <p>Loading Residence Form...</p>;
        case VerificationOutcome.ShiftedAndDoorLocked:
          return caseData.shiftedResidenceReport ? <ShiftedResidenceForm caseData={caseData} /> : <p>Loading Shifted Residence Form...</p>;
        case VerificationOutcome.NSPAndDoorLocked:
          return caseData.nspResidenceReport ? <NspResidenceForm caseData={caseData} /> : <p>Loading NSP Residence Form...</p>;
        case VerificationOutcome.ERT:
            return caseData.entryRestrictedResidenceReport ? <EntryRestrictedResidenceForm caseData={caseData} /> : <p>Loading Entry Restricted Form...</p>;
        case VerificationOutcome.Untraceable:
            return caseData.untraceableResidenceReport ? <UntraceableResidenceForm caseData={caseData} /> : <p>Loading Untraceable Residence Form...</p>;
        default:
            return renderOutcomeSelectionPrompt();
      }
    }

    if (caseData.verificationType === VerificationType.ResidenceCumOffice) {
        switch (caseData.verificationOutcome) {
            case VerificationOutcome.PositiveAndDoorLocked:
                return caseData.resiCumOfficeReport ? <PositiveResiCumOfficeForm caseData={caseData} /> : <p>Loading Resi-cum-Office Form...</p>;
            case VerificationOutcome.ShiftedAndDoorLocked:
                return caseData.shiftedResiCumOfficeReport ? <ShiftedResiCumOfficeForm caseData={caseData} /> : <p>Loading Shifted Resi-cum-Office Form...</p>;
            case VerificationOutcome.NSPAndDoorLocked:
                return caseData.nspResiCumOfficeReport ? <NspResiCumOfficeForm caseData={caseData} /> : <p>Loading NSP Resi-cum-Office Form...</p>;
            case VerificationOutcome.ERT:
                return caseData.entryRestrictedResiCumOfficeReport ? <EntryRestrictedResiCumOfficeForm caseData={caseData} /> : <p>Loading ERT Resi-cum-Office Form...</p>;
            case VerificationOutcome.Untraceable:
                return caseData.untraceableResiCumOfficeReport ? <UntraceableResiCumOfficeForm caseData={caseData} /> : <p>Loading Untraceable Resi-cum-Office Form...</p>;
            default:
                return renderOutcomeSelectionPrompt();
        }
    }

    if (caseData.verificationType === VerificationType.Office) {
        switch (caseData.verificationOutcome) {
            case VerificationOutcome.PositiveAndDoorLocked:
                return caseData.positiveOfficeReport ? <PositiveOfficeForm caseData={caseData} /> : <p>Loading Office Form...</p>;
            case VerificationOutcome.ShiftedAndDoorLocked:
                return caseData.shiftedOfficeReport ? <ShiftedOfficeForm caseData={caseData} /> : <p>Loading Shifted Office Form...</p>;
            case VerificationOutcome.NSPAndDoorLocked:
                return caseData.nspOfficeReport ? <NspOfficeForm caseData={caseData} /> : <p>Loading NSP Office Form...</p>;
            case VerificationOutcome.ERT:
                return caseData.entryRestrictedOfficeReport ? <EntryRestrictedOfficeForm caseData={caseData} /> : <p>Loading ERT Office Form...</p>;
            case VerificationOutcome.Untraceable:
                return caseData.untraceableOfficeReport ? <UntraceableOfficeForm caseData={caseData} /> : <p>Loading Untraceable Office Form...</p>;
            default:
                return renderOutcomeSelectionPrompt();
        }
    }

    if (caseData.verificationType === VerificationType.Business) {
        switch (caseData.verificationOutcome) {
            case VerificationOutcome.PositiveAndDoorLocked:
                return caseData.positiveBusinessReport ? <PositiveBusinessForm caseData={caseData} /> : <p>Loading Business Form...</p>;
            case VerificationOutcome.ShiftedAndDoorLocked:
                return caseData.shiftedBusinessReport ? <ShiftedBusinessForm caseData={caseData} /> : <p>Loading Shifted Business Form...</p>;
            case VerificationOutcome.NSPAndDoorLocked:
                return caseData.nspBusinessReport ? <NspBusinessForm caseData={caseData} /> : <p>Loading NSP Business Form...</p>;
            case VerificationOutcome.ERT:
                return caseData.entryRestrictedBusinessReport ? <EntryRestrictedBusinessForm caseData={caseData} /> : <p>Loading ERT Business Form...</p>;
            case VerificationOutcome.Untraceable:
                return caseData.untraceableBusinessReport ? <UntraceableBusinessForm caseData={caseData} /> : <p>Loading Untraceable Business Form...</p>;
            default:
                return renderOutcomeSelectionPrompt();
        }
    }
    
    if (caseData.verificationType === VerificationType.Builder) {
        switch (caseData.verificationOutcome) {
            case VerificationOutcome.PositiveAndDoorLocked:
                return caseData.positiveBuilderReport ? <PositiveBuilderForm caseData={caseData} /> : <p>Loading Builder Form...</p>;
            case VerificationOutcome.ShiftedAndDoorLocked:
                return caseData.shiftedBuilderReport ? <ShiftedBuilderForm caseData={caseData} /> : <p>Loading Shifted Builder Form...</p>;
            case VerificationOutcome.NSPAndDoorLocked:
                return caseData.nspBuilderReport ? <NspBuilderForm caseData={caseData} /> : <p>Loading NSP Builder Form...</p>;
            case VerificationOutcome.ERT:
                return caseData.entryRestrictedBuilderReport ? <EntryRestrictedBuilderForm caseData={caseData} /> : <p>Loading ERT Builder Form...</p>;
            case VerificationOutcome.Untraceable:
                return caseData.untraceableBuilderReport ? <UntraceableBuilderForm caseData={caseData} /> : <p>Loading Untraceable Builder Form...</p>;
            default:
                return renderOutcomeSelectionPrompt();
        }
    }

    if (caseData.verificationType === VerificationType.NOC) {
        switch (caseData.verificationOutcome) {
            case VerificationOutcome.PositiveAndDoorLocked:
                return caseData.positiveNocReport ? <PositiveNocForm caseData={caseData} /> : <p>Loading NOC Form...</p>;
            case VerificationOutcome.ShiftedAndDoorLocked:
                return caseData.shiftedNocReport ? <ShiftedNocForm caseData={caseData} /> : <p>Loading Shifted NOC Form...</p>;
            case VerificationOutcome.NSPAndDoorLocked:
                return caseData.nspNocReport ? <NspNocForm caseData={caseData} /> : <p>Loading NSP NOC Form...</p>;
            case VerificationOutcome.ERT:
                return caseData.entryRestrictedNocReport ? <EntryRestrictedNocForm caseData={caseData} /> : <p>Loading ERT NOC Form...</p>;
            case VerificationOutcome.Untraceable:
                return caseData.untraceableNocReport ? <UntraceableNocForm caseData={caseData} /> : <p>Loading Untraceable NOC Form...</p>;
            default:
                return renderOutcomeSelectionPrompt();
        }
    }

    if (caseData.verificationType === VerificationType.Connector) {
        switch (caseData.verificationOutcome) {
            case VerificationOutcome.PositiveAndDoorLocked:
                return caseData.positiveDsaReport ? <PositiveDsaForm caseData={caseData} /> : <p>Loading DSA/DST Form...</p>;
            case VerificationOutcome.ShiftedAndDoorLocked:
                return caseData.shiftedDsaReport ? <ShiftedDsaForm caseData={caseData} /> : <p>Loading Shifted DSA/DST Form...</p>;
            case VerificationOutcome.NSPAndDoorLocked:
                return caseData.nspDsaReport ? <NspDsaForm caseData={caseData} /> : <p>Loading NSP DSA/DST Form...</p>;
            case VerificationOutcome.ERT:
                return caseData.entryRestrictedDsaReport ? <EntryRestrictedDsaForm caseData={caseData} /> : <p>Loading ERT DSA/DST Form...</p>;
            case VerificationOutcome.Untraceable:
                return caseData.untraceableDsaReport ? <UntraceableDsaForm caseData={caseData} /> : <p>Loading Untraceable DSA/DST Form...</p>;
            default:
                return renderOutcomeSelectionPrompt();
        }
    }

    if (caseData.verificationType === VerificationType.PropertyAPF) {
        switch (caseData.verificationOutcome) {
            case VerificationOutcome.PositiveAndDoorLocked:
            case VerificationOutcome.NSPAndDoorLocked:
                return (caseData.positivePropertyApfReport || caseData.nspPropertyApfReport) ?
                    <PositiveNegativePropertyApfForm caseData={caseData} /> :
                    <p>Loading Property APF Form...</p>;
            case VerificationOutcome.ERT:
                return caseData.entryRestrictedPropertyApfReport ? <EntryRestrictedPropertyApfForm caseData={caseData} /> : <p>Loading ERT Property (APF) Form...</p>;
            case VerificationOutcome.Untraceable:
                return caseData.untraceablePropertyApfReport ? <UntraceablePropertyApfForm caseData={caseData} /> : <p>Loading Untraceable Property (APF) Form...</p>;
            default:
                return renderOutcomeSelectionPrompt();
        }
    }

    if (caseData.verificationType === VerificationType.PropertyIndividual) {
        switch (caseData.verificationOutcome) {
            case VerificationOutcome.PositiveAndDoorLocked:
                return caseData.positivePropertyIndividualReport ? <PositivePropertyIndividualForm caseData={caseData} /> : <p>Loading Property (Individual) Form...</p>;
            case VerificationOutcome.NSPAndDoorLocked:
                return caseData.nspPropertyIndividualReport ? <NspPropertyIndividualForm caseData={caseData} /> : <p>Loading NSP Property (Individual) Form...</p>;
            case VerificationOutcome.ERT:
                return caseData.entryRestrictedPropertyIndividualReport ? <EntryRestrictedPropertyIndividualForm caseData={caseData} /> : <p>Loading ERT Property (Individual) Form...</p>;
            case VerificationOutcome.Untraceable:
                return caseData.untraceablePropertyIndividualReport ? <UntraceablePropertyIndividualForm caseData={caseData} /> : <p>Loading Untraceable Property (Individual) Form...</p>;
            default:
                return renderOutcomeSelectionPrompt();
        }
    }

    return (
        <p className="text-medium-text mt-4">No specific form for this verification type/outcome combination.</p>
    );
  };


  return (
    <>
    <div className={`bg-dark-card rounded-lg shadow-lg mb-4 mx-4 p-4 transition-all duration-300 ${statusColor[caseData.status]} ${hasAutoSaveData ? 'ring-2 ring-yellow-400 bg-yellow-900/20 border-yellow-400/50' : ''}`}>
      <div
        className={`flex justify-between items-start ${(caseData.status !== CaseStatus.Assigned && caseData.status !== CaseStatus.Completed && !caseData.isSaved) ? 'cursor-pointer' : ''}`}
        onClick={(caseData.status !== CaseStatus.Assigned && caseData.status !== CaseStatus.Completed && !caseData.isSaved) ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex-1">
          <div className="flex justify-between items-start">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">{caseData.verificationType}</p>
                    {hasAutoSaveData && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                        📝 Draft Saved
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-light-text">{caseData.title}</h3>
              </div>
              {timestamp.value && <p className="text-xs text-gray-400 text-right shrink-0 ml-2">{`${timestamp.label}`}<br/>{`${timestamp.value}`}</p>}
          </div>
          <p className="text-sm text-medium-text mt-1">{caseData.customer.name} - {caseData.id}</p>
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[8000px] mt-4' : 'max-h-0 overflow-hidden'}`}>
          {isInProgress && verificationOutcomeOptions && (
              <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                  <SelectField
                      label="Verification Outcome"
                      id={`outcome-${caseData.id}`}
                      name="verificationOutcome"
                      value={caseData.verificationOutcome || ''}
                      onChange={handleOutcomeChange}
                  >
                      <option value="">Select Outcome...</option>
                      {verificationOutcomeOptions}
                  </SelectField>
              </div>
          )}
          <div
            ref={formContentRef}
            style={{
              maxHeight: isExpanded ? '70vh' : '0',
              overflowY: isExpanded ? 'auto' : 'hidden',
              overflowX: 'hidden',
              transition: 'max-height 0.5s ease-in-out',
              // Custom scrollbar styling
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 #1F2937'
            }}
            className="custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {isFormExpanding ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                color: '#9CA3AF'
              }}>
                <Spinner size="small" />
                <span style={{ marginLeft: '8px', fontSize: '14px' }}>Opening form...</span>
              </div>
            ) : (
              <div style={{
                paddingRight: '8px',
                paddingBottom: '16px',
                paddingTop: '8px'
              }}>
                {renderFormContent()}
                {isFormScrollable && (
                  <div style={{
                    position: 'sticky',
                    bottom: '0',
                    textAlign: 'center',
                    padding: '8px',
                    background: 'linear-gradient(transparent, #1F2937)',
                    color: '#9CA3AF',
                    fontSize: '12px',
                    pointerEvents: 'none'
                  }}>
                    ↓ Scroll down for more fields ↓
                  </div>
                )}
              </div>
            )}
          </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dark-border">
        {isAssigned ? (
            <div className="flex justify-around items-center">
                <button 
                    onClick={() => updateCaseStatus(caseData.id, CaseStatus.InProgress)}
                    className="flex flex-col items-center text-green-400 hover:text-green-300 transition-colors"
                >
                    <CheckIcon />
                    <span className="text-xs mt-1">Accept</span>
                </button>
                <button 
                    onClick={() => setIsRevokeModalOpen(true)}
                    className="flex flex-col items-center text-red-400 hover:text-red-300 transition-colors"
                >
                    <XIcon />
                    <span className="text-xs mt-1">Revoke</span>
                </button>
                <button 
                    onClick={() => setIsInfoModalOpen(true)}
                    className="flex flex-col items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                    <InfoIcon />
                    <span className="text-xs mt-1">Info</span>
                </button>
            </div>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              {isReorderable ? (
                <div className="flex items-center space-x-2">
                  <button onClick={(e) => { e.stopPropagation(); reorderInProgressCase(caseData.id, 'up'); }} disabled={isFirst} className="p-2 rounded-full disabled:text-gray-600 disabled:cursor-not-allowed text-medium-text hover:text-light-text transition-colors">
                      <ArrowUpIcon />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); reorderInProgressCase(caseData.id, 'down'); }} disabled={isLast} className="p-2 rounded-full disabled:text-gray-600 disabled:cursor-not-allowed text-medium-text hover:text-light-text transition-colors">
                      <ArrowDownIcon />
                  </button>
                </div>
              ) : (caseData.isSaved && caseData.status !== CaseStatus.Completed) ? (
                <button
                    onClick={handleSummarizeReport}
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors p-2 rounded-md hover:bg-white/10"
                    disabled={isSummarizingReport}
                >
                    {isSummarizingReport ? <div className="w-4 h-4"><Spinner size="small" /></div> : <SparklesIcon />}
                    <span className="text-xs">{isSummarizingReport ? 'Summarizing...' : 'AI Summary'}</span>
                </button>
              ) : <div />}
            </div>

            <div className="flex items-center gap-2">
              {caseData.isSaved && (
                  <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          updateCaseStatus(caseData.id, CaseStatus.Completed);
                      }}
                      className="px-4 py-2 text-sm font-semibold rounded-md bg-green-600 hover:bg-green-500 text-white transition-colors"
                  >
                      Submit Case
                  </button>
              )}

              {/* Only show expand/collapse button for non-completed and non-saved cases */}
              {!(caseData.status === CaseStatus.Completed || caseData.isSaved) && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center text-medium-text p-2 rounded-md hover:bg-white/10">
                    {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    <span className="text-xs ml-1">
                        {isExpanded ? 'Hide Details' : 'Select Outcome'}
                    </span>
                </button>
              )}
            </div>
        </div>
        )}
      </div>
    </div>

    <Modal isVisible={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Case Information">
        <div className="text-light-text space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                    <h4 className="font-bold text-sm text-medium-text">Customer Name</h4>
                    <p>{caseData.customer.name}</p>
                </div>
                <div>
                    <h4 className="font-bold text-sm text-medium-text">Bank Name</h4>
                    <p>{caseData.bankName || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-bold text-sm text-medium-text">Product</h4>
                    <p>{caseData.product || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-bold text-sm text-medium-text">Trigger</h4>
                    <p>{caseData.trigger || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                    <h4 className="font-bold text-sm text-medium-text">Visit Address</h4>
                    <p>{caseData.visitAddress || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-bold text-sm text-medium-text">System Contact Number</h4>
                    <p>{caseData.systemContactNumber || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-bold text-sm text-medium-text">Customer Calling Code</h4>
                    <p>{caseData.customerCallingCode || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-bold text-sm text-medium-text">Applicant Status</h4>
                    <p>{caseData.applicantStatus || 'N/A'}</p>
                </div>
            </div>
             <div className="flex justify-end pt-4">
                <button
                    onClick={() => setIsInfoModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-brand-primary hover:bg-brand-secondary text-white font-semibold"
                >
                    Close
                </button>
            </div>
        </div>
    </Modal>

    <Modal isVisible={isRevokeModalOpen} onClose={() => setIsRevokeModalOpen(false)} title="Revoke Case">
        <div className="space-y-4">
            <SelectField
                label="Reason for Revocation"
                id={`revoke-reason-${caseData.id}`}
                name="revokeReason"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value as RevokeReason)}
            >
                {Object.values(RevokeReason).map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                ))}
            </SelectField>
            <p className="text-sm text-medium-text">
                This will remove the case from your device and send it back to the server. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => setIsRevokeModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-light-text font-semibold"
                >
                    Cancel
                </button>
                <button
                    onClick={handleRevokeConfirm}
                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white font-semibold"
                >
                    Confirm Revoke
                </button>
            </div>
        </div>
    </Modal>

    <Modal isVisible={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="AI Report Summary">
        {isSummarizingReport ? (
            <div className="flex justify-center items-center h-24">
                <Spinner />
            </div>
        ) : (
            <div className="text-light-text space-y-4">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {summaryContent.split('\n').map((line, index) => {
                        const trimmedLine = line.trim();
                        if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
                            return (
                                <div key={index} className="flex items-start mb-2">
                                    <span className="text-brand-primary mr-2 mt-1">&#8226;</span>
                                    <span>{trimmedLine.substring(1).trim()}</span>
                                </div>
                            )
                        }
                        return <p key={index} className="mb-2">{line}</p>
                    })}
                </div>
                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => setIsSummaryModalOpen(false)}
                        className="px-4 py-2 rounded-md bg-brand-primary hover:bg-brand-secondary text-white font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
    </Modal>
    </>
  );
};

export default CaseCard;