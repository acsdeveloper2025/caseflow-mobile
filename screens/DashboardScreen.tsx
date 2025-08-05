import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useCases } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { CaseStatus } from '../types';
import { useNavigation } from '@react-navigation/native';
import { RefreshCwIcon, UserIcon } from '../components/Icons';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledImage = styled(Image);


interface StatCardProps {
  title: string;
  count: number;
  color: string;
  path: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, color, path }) => {
    const navigation = useNavigation<any>();
    return (
        <StyledTouchableOpacity onPress={() => navigation.navigate(path)} className={`bg-dark-card p-4 rounded-lg shadow-lg flex-1 active:bg-gray-700 ${color}`}>
            <StyledText className="text-medium-text text-sm font-bold uppercase">{title}</StyledText>
            <StyledText className="text-light-text text-3xl font-semibold mt-2">{count}</StyledText>
        </StyledTouchableOpacity>
    );
};

const DashboardScreen: React.FC = () => {
  const { cases, loading, syncing, syncCases } = useCases();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  
  const assignedCount = cases.filter(c => c.status === CaseStatus.Assigned).length;
  const inProgressCount = cases.filter(c => c.status === CaseStatus.InProgress).length;
  const completedCount = cases.filter(c => c.status === CaseStatus.Completed).length;
  const savedCount = cases.filter(c => c.isSaved).length;

  return (
    <StyledSafeAreaView className="flex-1 bg-dark-bg">
      <ScrollView>
        <StyledView className="p-4 flex-row justify-between items-center">
          <StyledView>
              <StyledText className="text-2xl font-bold text-light-text">Welcome, {user?.name || 'Agent'}!</StyledText>
              <StyledText className="text-medium-text">Here is your daily summary.</StyledText>
          </StyledView>
          <StyledTouchableOpacity onPress={() => navigation.navigate('Profile')} className="w-12 h-12 rounded-full bg-dark-card border-2 border-dark-border items-center justify-center">
              {user?.profilePhotoUrl ? (
                  <StyledImage source={{uri: user.profilePhotoUrl}} className="w-full h-full rounded-full" />
              ) : (
                  <UserIcon color="#f9fafb" />
              )}
          </StyledTouchableOpacity>
        </StyledView>

        {loading ? (
          <StyledView className="flex-1 justify-center items-center mt-10">
              <ActivityIndicator size="large" color="#00a950" />
          </StyledView>
        ) : (
        <>
          <StyledView className="px-4 mt-4">
              <StyledTouchableOpacity
                  onPress={syncCases}
                  disabled={syncing}
                  className="w-full bg-brand-primary active:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg flex-row items-center justify-center disabled:bg-gray-600"
              >
                  <RefreshCwIcon color="white" />
                  <StyledText className="ml-2 text-white font-bold">{syncing ? 'Syncing...' : 'Sync with Server'}</StyledText>
              </StyledTouchableOpacity>
          </StyledView>

          <StyledView className="p-4 mt-4">
            <StyledView className="flex-row gap-4">
              <StatCard title="Assigned" count={assignedCount} color="border-t-4 border-blue-500" path="Assigned"/>
              <StatCard title="In Progress" count={inProgressCount} color="border-t-4 border-yellow-500" path="In Progress" />
            </StyledView>
            <StyledView className="flex-row gap-4 mt-4">
              <StatCard title="Completed" count={completedCount} color="border-t-4 border-green-500" path="Completed"/>
              <StatCard title="Saved" count={savedCount} color="border-t-4 border-purple-500" path="Saved" />
            </StyledView>
          </StyledView>
          
          <StyledView className="px-4 mt-6">
              <StyledText className="text-xl font-bold text-light-text mb-2">Recent Activity</StyledText>
              <StyledText className="text-medium-text">Sync to get the latest updates from the server.</StyledText>
          </StyledView>
        </>
        )}
      </ScrollView>
    </StyledSafeAreaView>
  );
};

export default DashboardScreen;
