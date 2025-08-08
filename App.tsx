import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaseProvider } from './context/CaseContext';
import NewLoginScreen from './screens/NewLoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import CaseListScreen from './screens/CaseListScreen';
import AssignedCasesScreen from './screens/AssignedCasesScreen';
import InProgressCasesScreen from './screens/InProgressCasesScreen';
import CompletedCasesScreen from './screens/CompletedCasesScreen';
import SavedCasesScreen from './screens/SavedCasesScreen';
import ProfileScreen from './screens/ProfileScreen';
import DigitalIdCardScreen from './screens/DigitalIdCardScreen';
import BottomNavigation from './components/BottomNavigation';
import { SafeAreaProvider, MobileContainer } from './components/SafeAreaProvider';
import { ResponsiveLayoutProvider } from './components/ResponsiveLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { View } from 'react-native';

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <MobileContainer>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          height: '100vh'
        }}>
          <div style={{ color: '#00a950', fontSize: '18px' }}>Loading...</div>
        </View>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/" element={<DashboardScreen />} />
            <Route path="/cases" element={<CaseListScreen title="All Cases" filter={() => true} emptyMessage="No cases available." tabKey="all" searchPlaceholder="Search all cases..." />} />
            <Route path="/cases/assigned" element={<AssignedCasesScreen />} />
            <Route path="/cases/in-progress" element={<InProgressCasesScreen />} />
            <Route path="/cases/completed" element={<CompletedCasesScreen />} />
            <Route path="/cases/saved" element={<SavedCasesScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/digital-id-card" element={<DigitalIdCardScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<NewLoginScreen />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
      {isAuthenticated && <BottomNavigation />}
    </MobileContainer>
  );
};



const App: React.FC = () => {

  try {
    return (
      <ErrorBoundary>
        <BrowserRouter>
          <SafeAreaProvider>
            <ResponsiveLayoutProvider>
              <AuthProvider>
                <CaseProvider>
                  <AppNavigator />
                </CaseProvider>
              </AuthProvider>
            </ResponsiveLayoutProvider>
          </SafeAreaProvider>
        </BrowserRouter>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App render error:', error);
    return (
      <div style={{
        backgroundColor: '#111827',
        color: '#ffffff',
        padding: '20px',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>App Error</h1>
        <p>Failed to render app: {String(error)}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
};

export default App;
