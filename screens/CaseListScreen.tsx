import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, FlatListProps } from 'react-native';
import { Case } from '../types';
import { useCases } from '../context/CaseContext';
import CaseCard from '../components/CaseCard';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledFlatList = styled(FlatList) as React.ComponentType<FlatListProps<any> & { className?: string }>;


interface CaseListScreenProps {
  title: string;
  filter: (caseData: Case) => boolean;
  emptyMessage: string;
  sort?: (a: Case, b: Case) => number;
  isReorderable?: boolean;
}

const CaseListScreen: React.FC<CaseListScreenProps> = ({ title, filter, emptyMessage, sort, isReorderable = false }) => {
  const { cases, loading } = useCases();
  
  const processedCases = useMemo(() => {
    let filtered = cases.filter(filter);
    if (sort) {
      filtered.sort(sort);
    }
    return filtered;
  }, [cases, filter, sort]);

  const renderEmpty = () => (
    <StyledView className="flex-1 justify-center items-center mt-10 px-4">
      <StyledText className="text-medium-text text-center">{emptyMessage}</StyledText>
    </StyledView>
  );

  const renderHeader = () => (
     <StyledText className="text-2xl font-bold text-light-text px-4 mb-4 pt-5">{title}</StyledText>
  );

  if (loading) {
    return (
      <StyledSafeAreaView className="flex-1 bg-dark-bg">
        {renderHeader()}
        <StyledView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00a950" />
        </StyledView>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-dark-bg">
      <StyledFlatList
        data={processedCases}
        renderItem={({ item, index }: { item: Case, index: number }) => (
          <CaseCard 
            caseData={item} 
            isReorderable={isReorderable}
            isFirst={index === 0}
            isLast={index === processedCases.length - 1}
          />
        )}
        keyExtractor={(item: Case) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="pt-5"
      />
    </StyledSafeAreaView>
  );
};

export default CaseListScreen;
