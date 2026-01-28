import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import StudentSignInScreen from './screens/StudentSignInScreen';
import StudentSignUpScreen from './screens/StudentSignUpScreen';
import AdminSignInScreen from './screens/AdminSignInScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import StudentDashboardScreen from './screens/StudentDashboardScreen';
import CurrentQueueStatus from './screens/CurrentQueueStatus';
import BookAppointment from './screens/BookAppointment';
import ViewMyBookings from './screens/ViewMyBookings';
import Notifications from './screens/Notifications';
import CancelAppointment from './screens/CancelAppointment';
import RescheduleAppointment from './screens/RescheduleAppointment';
import TodaysAppointments from './screens/TodaysAppointments';
import BookingStats from './screens/BookingStats';
import ResetPassword from './screens/ResetPassword';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StudentSignInScreen"
          component={StudentSignInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="StudentSignUpScreen"
          component={StudentSignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminSignInScreen"
          component={AdminSignInScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="StudentDashboardScreen"
          component={StudentDashboardScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AdminDashboardScreen"
          component={AdminDashboardScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="CurrentQueueStatus"
          component={CurrentQueueStatus}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="BookAppointment"
          component={BookAppointment}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ViewMyBookings"
          component={ViewMyBookings}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Notifications"
          component={Notifications}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="CancelAppointment"
          component={CancelAppointment}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="RescheduleAppointment"
          component={RescheduleAppointment}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="TodaysAppointments"
          component={TodaysAppointments}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="BookingStats"
          component={BookingStats}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
