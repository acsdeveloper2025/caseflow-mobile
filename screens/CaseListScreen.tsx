import React, { useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, FlatListProps, TouchableOpacity } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Case } from '../types';
import { useCases } from '../context/CaseContext';
import CaseCard from '../components/CaseCard';




interface CaseListScreenProps {
  title: string;
  filter: (caseData: Case) => boolean;
  emptyMessage: string;
  sort?: (a: Case, b: Case) => number;
  isReorderable?: boolean;
}

const CaseListScreen: React.FC<CaseListScreenProps> = ({ title, filter, emptyMessage, sort, isReorderable = false }) => {
  const { cases, loading } = useCases();
  const navigate = useNavigate();
  
  const processedCases = useMemo(() => {
    let filtered = cases.filter(filter);
    if (sort) {
      filtered.sort(sort);
    }
    return filtered;
  }, [cases, filter, sort]);

  const renderEmpty = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40, paddingHorizontal: 16 }}>
      <Text style={{ color: '#9CA3AF', textAlign: 'center' }}>{emptyMessage}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity
          onPress={() => navigate('/')}
          style={{
            marginRight: 16,
            padding: 8,
            borderRadius: 20,
            backgroundColor: '#374151'
          }}
        >
          <Text style={{ color: '#F9FAFB', fontSize: 18, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F9FAFB', flex: 1 }}>{title}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
        {renderHeader()}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00a950" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
      <FlatList
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
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
      />
    </SafeAreaView>
  );
};

export default CaseListScreen;
