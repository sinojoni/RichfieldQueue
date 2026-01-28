import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { db, auth } from './config/firebaseConfig';
import { collection, getDocs, query, where, addDoc, Timestamp, doc, onSnapshot } from 'firebase/firestore';

export default function BookAppointment({ navigation }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [serverHour, setServerHour] = useState(0);
  const [serverMinute, setServerMinute] = useState(0);

  const appointmentOptions = ['Finance', 'Records', 'Access card collection', 'Pin setup', 'Registrations'];
  const timeSlots = [ 
  '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM',
  '03:00 PM', '04:00 PM'
];


  useEffect(() => {
    const fetchServerTime = async () => {
      const now = Timestamp.now().toDate();
      const localHour = (now.getUTCHours() + 2) % 24; 
      const localMinute = now.getUTCMinutes();
      setServerHour(localHour);
      setServerMinute(localMinute);
    };

    fetchServerTime();
    const interval = setInterval(fetchServerTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const queueDocRef = doc(db, 'queueStatus', 'currentQueue');
    const unsubscribe = onSnapshot(queueDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const queueData = docSnap.data()?.queueData || {};
        setIsActive(queueData.status === 'active');
      } else {
        setIsActive(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      const today = new Date().toISOString().split('T')[0];
      const snapshot = await getDocs(query(collection(db, 'appointments'), where('date', '==', today)));
      const booked = snapshot.docs.map(doc => doc.data().timeSlot);
      setBookedSlots(booked);
    };
    fetchBookedSlots();
  }, []);

  const isBookingOpen = serverHour >= 8 && serverHour < 16;

  const isSlotDisabled = (slot) => {
    if (!isBookingOpen) return true;

    const [hourStr, meridiem] = slot.split(' ');
    let hour = parseInt(hourStr.split(':')[0], 10);

    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;

    return serverHour > hour;
  };

  const handleBooking = async () => {
    if (!selectedOption || !selectedTime) {
      Alert.alert('Incomplete', 'Please select a service and time slot');
      return;
    }
    if (!isActive) {
      Alert.alert("Queue Inactive", "You cannot book an appointment right now.");
      return;
    }
    if (!isBookingOpen) {
      Alert.alert("Booking Closed", "Bookings are closed for the day. Please try again tomorrow at 8 AM.");
      return;
    }

    try {
      const appointmentsRef = collection(db, 'appointments');
      const today = new Date().toISOString().split('T')[0];

      const snapshot = await getDocs(query(appointmentsRef, where('date', '==', today)));
      const queueNumbers = snapshot.docs.map(doc => doc.data().queueNumber);
      const nextQueueNumber = queueNumbers.length > 0 ? Math.max(...queueNumbers) + 1 : 1;

      const appointmentData = {
        uid: auth.currentUser.uid,
        department: selectedOption,
        timeSlot: selectedTime,
        date: today,
        queueNumber: nextQueueNumber,
        status: 'pending',
        createdAt: Timestamp.now()
      };

      await addDoc(appointmentsRef, appointmentData);
      Alert.alert('Booking Confirmed', `Your queue number is ${nextQueueNumber}`);
      setSelectedOption(null);
      setSelectedTime(null);

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>RICHFIELD</Text>
      <Text style={styles.subtitle}>Digital queueing system</Text>

      <Text style={styles.title2}>Book Appointment</Text>
      <Text style={styles.title3}>Choose service department:</Text>

      {appointmentOptions.map(option => (
        <TouchableOpacity key={option} style={styles.radioContainer} onPress={() => setSelectedOption(option)}>
          <Text style={styles.radioText}>{option}</Text>
          <View style={styles.outerCircle}>
            {selectedOption === option && <View style={styles.innerCircle} />}
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.title3}>Select a time slot:</Text>
      <View style={styles.timeSlotContainer}>
        {timeSlots.map(slot => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.timeSlotButton,
              selectedTime === slot && styles.selectedTimeSlot,
              isSlotDisabled(slot) && { backgroundColor: 'red' }
            ]}
            onPress={() => !isSlotDisabled(slot) && setSelectedTime(slot)}
            disabled={isSlotDisabled(slot)}
          >
            <Text style={styles.timeSlotText}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!isBookingOpen && (
        <Text style={{ color: 'red', fontSize: 18, marginTop: 20 }}>
          Bookings are closed for the day
        </Text>
      )}

      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: isBookingOpen && isActive ? 'green' : 'grey' }]}
        onPress={handleBooking}
        disabled={!isBookingOpen || !isActive}
      >
        <Text style={styles.buttonText1}>Book Appointment</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StudentDashboardScreen')}>
        <Text style={styles.buttonText2}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 30,
  },
  logo: { width: 50, height: 50, marginRight: 330, marginTop: '10%', borderRadius: 10 },
  subtitle: { color: 'darkblue', fontSize: 10, marginRight: 100 },
  title: { fontSize: 30, marginTop: -40, marginLeft: -130, color: 'darkblue' },
  title2: { fontSize: 24, color: 'darkblue', marginTop: 30, marginRight: 150, fontWeight: 'bold' },
  title3: { color: 'darkblue', fontSize: 20, marginTop: 50 },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
    paddingVertical: 10,
  },
  outerCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'darkblue',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  innerCircle: { height: 12, width: 12, borderRadius: 6, backgroundColor: 'darkblue' },
  radioText: { fontSize: 18, color: 'darkblue' }, 
  bookButton: { width: 170, height: 60, marginTop: 20, paddingVertical: 12, borderRadius: 8, marginLeft: 180 },
  buttonText1: { color: 'white', fontSize: 18, marginLeft: 10 }, 
  button: {
    width: 170,
    height: 60,
    marginRight: 170,
    marginTop: -60,
    backgroundColor: 'darkblue',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 100,
  },
  buttonText2: { color: 'white', fontSize: 18, marginLeft: 50 }, 
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 10,
    gap: 10,
  },
  timeSlotButton: {
    backgroundColor: 'grey',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  selectedTimeSlot: { backgroundColor: 'green' },
  timeSlotText: { color: 'white' }, 
});
