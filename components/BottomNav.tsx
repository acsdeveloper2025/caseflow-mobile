import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeIcon, ListTodoIcon, ClockIcon, CheckCircle2Icon, StarIcon, UserIcon } from './Icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import AssignedCasesScreen from '../screens/AssignedCasesScreen';
import InProgressCasesScreen from '../screens/InProgressCasesScreen';
import CompletedCasesScreen from '../screens/CompletedCasesScreen';
import SavedCasesScreen from '../screens/SavedCasesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          const iconProps = { color, width: size, height: size };
          if (route.name === 'Dashboard') return <HomeIcon {...iconProps} />;
          if (route.name === 'Assigned') return <ListTodoIcon {...iconProps} />;
          if (route.name === 'In Progress') return <ClockIcon {...iconProps} />;
          if (route.name === 'Completed') return <CheckCircle2Icon {...iconProps} />;
          if (route.name === 'Saved') return <StarIcon {...iconProps} filled={focused} />;
          if (route.name === 'Profile') return <UserIcon {...iconProps} />;
          return null;
        },
        tabBarStyle: {
          backgroundColor: '#1f2937', // dark-card
          borderTopColor: '#374151', // dark-border
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#00a950', // brand-primary
        tabBarInactiveTintColor: '#9ca3af', // medium-text
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Assigned" component={AssignedCasesScreen} />
      <Tab.Screen name="In Progress" component={InProgressCasesScreen} />
      <Tab.Screen name="Completed" component={CompletedCasesScreen} />
      <Tab.Screen name="Saved" component={SavedCasesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
