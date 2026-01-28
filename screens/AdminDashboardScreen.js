import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';

export default function AdminDashboardScreen({ route, navigation }) {
  const routeUsername = route.params?.username; // get username from AdminSignIn
  const adminName = routeUsername || 'Admin';

  const handleLogout = () => {
    navigation.replace('HomeScreen'); // For dummy, we skip Firebase logout
    // If using Firebase auth, uncomment below:
    /*
    signOut(auth).then(() => {
      navigation.replace('HomeScreen');
    }).catch((error) => {
      console.log('Logout error:', error.message);
    });
    */
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
        <View>
          <Text style={styles.title}>RICHFIELD</Text>
          <Text style={styles.subtitle}>Digital Queueing System</Text>
           <Text style={styles.welcome}>Welcome, {adminName}!</Text>
        </View>
       
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#1E3D59' }]}
        onPress={() => navigation.navigate('TodaysAppointments')}
      >
        <Text style={styles.buttonText}>Today's Appointments</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
        onPress={() => navigation.navigate('BookingStats')}
      >
        <Text style={styles.buttonText}>Booking Statistics</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#757575' }]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '20%',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    marginBottom: '10%'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3D59',
    marginTop: '20%'
  },
  subtitle: {
    fontSize: 14,
    color: '#1E3D59',
    marginTop: 2,
  },
  welcome: {
    fontSize: 18,
    color: '#1E3D59',
    marginTop: '30%',
    marginRight: '20%'
    
  },
  button: {
    width: 250,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
