import React from 'react';
import { Case } from '../../../types';

interface ResidenceFormProps {
  caseData: Case;
}

const ResidenceFormSimple: React.FC<ResidenceFormProps> = ({ caseData }) => {
  return (
    <div className="residence-form">
      <h2>Residence Form</h2>
      <p>Case ID: {caseData.id}</p>
      <p>Customer: {caseData.customer.name}</p>
      <p>Status: {caseData.status}</p>
    </div>
  );
};

export default ResidenceFormSimple;
