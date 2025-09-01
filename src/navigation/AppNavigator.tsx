// Main App Navigator - Clean navigation structure
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CreateGoalScreen } from '../screens/CreateGoalScreen';
import { EditGoalScreen } from '../screens/EditGoalScreen';

import { RootStackParamList, BottomTabParamList } from '../types/navigation';
import { COLORS } from '../constants/config';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Main tab navigator (for authenticated users)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT.SECONDARY,
        tabBarStyle: {
          backgroundColor: COLORS.BACKGROUND.PRIMARY,
          borderTopColor: COLORS.BACKGROUND.SECONDARY,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.BACKGROUND.PRIMARY,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.TEXT.PRIMARY,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          title: 'Calendar',
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="📅" color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="GoalsTab" 
        component={GoalsScreen}
        options={{
          title: 'Goals',
          tabBarLabel: 'Goals',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🎯" color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="👤" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple tab icon component
const TabIcon = ({ icon, color }: { icon: string; color: string }) => (
  <Text style={{ fontSize: 24, color }}>{icon}</Text>
);

// Main app navigator
export const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // TODO: Add loading screen
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.BACKGROUND.PRIMARY },
        }}
      >
        {user ? (
          // Authenticated user flow
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="CreateGoal" 
              component={CreateGoalScreen}
              options={{
                headerShown: true,
                title: 'Create Goal',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="EditGoal" 
              component={EditGoalScreen}
              options={{
                headerShown: true,
                title: 'Edit Goal',
                presentation: 'modal',
              }}
            />
          </>
        ) : (
          // Unauthenticated user flow
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};