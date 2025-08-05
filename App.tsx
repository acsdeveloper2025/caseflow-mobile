import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CaseProvider } from './context/CaseContext';
import LoginScreen from './screens/LoginScreen';
import BottomTabNavigator from './components/BottomNav';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CaseProvider>
        <NavigationContainer>
           <StatusBar barStyle="light-content" />
           <AppNavigator />
        </NavigationContainer>
      </CaseProvider>
    </AuthProvider>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-dark-bg">
        <ActivityIndicator size="large" color="#00a950" />
      </StyledView>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default App;
