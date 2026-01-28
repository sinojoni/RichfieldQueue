import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './config/firebaseConfig';

export default function BookingDetailsScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const docRef = doc(db, 'appointments', bookingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBooking(docSnap.data());
        } else {
          Alert.alert('Error', 'Booking not found!');
        }
      } catch (error) {
        console.log('Error fetching booking:', error);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'appointments', bookingId));
              Alert.alert('Success', 'Appointment canceled!');
              navigation.goBack();
            } catch (error) {
              console.log('Error cancelling booking:', error);
            }
          },
        },
      ]
    );
  };

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', fontSize: 20 }}>Loading booking details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
        <View>
          <Text style={styles.title1}>RICHFIELD</Text>
          <Text style={styles.subtitle1}>Digital Queueing System</Text>
          <Text style={styles.subtitle2}>Booking Details</Text>
        </View>
      </View>

      <View style={styles.bookingCard}>
        <Text style={styles.label}>Department:</Text>
        <Text style={styles.value}>{booking.department || 'N/A'}</Text>

        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{booking.date || 'N/A'}</Text>

        <Text style={styles.label}>Time Slot:</Text>
        <Text style={styles.value}>{booking.timeSlot || 'N/A'}</Text>

        <Text style={styles.label}>Queue Number:</Text>
        <Text style={styles.value}>{booking.queueNumber || 'N/A'}</Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{booking.status || 'N/A'}</Text>

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button2}
          onPress={() => navigation.navigate('RescheduleAppointment', { bookingId })}
        >
          <Text style={styles.buttonText2}>Reschedule Appointment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { alignItems: 'center', paddingBottom: 50, backgroundColor: 'white' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: '20%', marginRight: '25%' },
  logo: { width: 50, height: 50, borderRadius: 10, marginRight: 10, marginBottom: '20%' },
  title1: { color: 'darkblue', fontSize: 20, fontWeight: 'bold' },
  subtitle1: { color: 'darkblue', fontSize: 15, marginBottom: 10 },
  subtitle2: { fontSize: 20, color: 'darkblue', marginTop: '10%', marginLeft: '20%' },
  bookingCard: { width: '90%', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 20, marginTop: 20, backgroundColor: '#f5f5f5' },
  label: { fontWeight: 'bold', marginTop: 10, color: 'darkblue' },
  value: { marginBottom: 5, fontSize: 16 },
  cancelButton: { backgroundColor: 'red', padding: 10, borderRadius: 10, marginTop: 15 },
  button2: { backgroundColor: 'green', padding: 10, borderRadius: 10, marginTop: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  buttonText2: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }
});
