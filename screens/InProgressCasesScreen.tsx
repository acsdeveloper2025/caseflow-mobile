
import React from 'react';
import { CaseStatus } from '../types';
import CaseListScreen from './CaseListScreen';

const InProgressCasesScreen: React.FC = () => {
  return (
    <CaseListScreen
      title="In Progress Cases"
      filter={(c) => c.status === CaseStatus.InProgress && !c.isSaved}
      sort={(a, b) => (a.order || 0) - (b.order || 0)}
      isReorderable={true}
      emptyMessage="No cases are currently in progress."
    />
  );
};

export default InProgressCasesScreen;