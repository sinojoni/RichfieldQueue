import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, FlatList } from 'react-native';
import { db, auth } from './config/firebaseConfig';
import { collection, query, where, onSnapshot, updateDoc, doc, Timestamp, addDoc, orderBy } from 'firebase/firestore';

export default function RescheduleAppointment({ navigation }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [queueData, setQueueData] = useState({ status: 'inactive', startTime: null });
  const [serverHour, setServerHour] = useState(0);
  const [serverMinute, setServerMinute] = useState(0);

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
    const unsubscribeQueue = onSnapshot(queueDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()?.queueData || { status: 'inactive', startTime: null };
        setQueueData(data);
        if (data.status !== 'active') {
          setAppointments([]);
          setSelectedAppointment(null);
          setSelectedTime(null);
        }
      } else {
        setQueueData({ status: 'inactive', startTime: null });
        setAppointments([]);
        setSelectedAppointment(null);
        setSelectedTime(null);
      }
    });

    return () => unsubscribeQueue();
  }, []);

  
  useEffect(() => {
    if (!queueData.startTime || queueData.status !== 'active') return;

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('createdAt', '>=', queueData.startTime),
      orderBy('createdAt'),
      orderBy('queueNumber')
    );

    const unsubscribeAppointments = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(a => a.status === 'pending' || a.status === 'rescheduled');

      setAppointments(data);
    });

    return () => unsubscribeAppointments();
  }, [queueData]);

  const isSlotDisabled = (slot) => {
    const [hourStr, meridiem] = slot.split(' ');
    let [hour] = hourStr.split(':').map(Number);

    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;

    return serverHour > hour; 
  };

  const handleBooking = async () => {
    if (!selectedAppointment) {
      Alert.alert('Select an appointment', 'Please select the appointment you want to reschedule.');
      return;
    }

    if (!selectedTime) {
      Alert.alert('Select a time slot', 'Please select a new time for your appointment.');
      return;
    }

    try {
      const apptRef = doc(db, 'appointments', selectedAppointment.id);

      await updateDoc(apptRef, {
        timeSlot: selectedTime,
        status: 'rescheduled',
        updatedAt: Timestamp.now(),
      });

      await addDoc(collection(db, 'notifications'), {
        uid: auth.currentUser.uid,
        message: `Your appointment has been rescheduled to ${selectedTime}`,
        status: 'rescheduled',
        read: false,
        createdAt: Timestamp.now()
      });

      Alert.alert('Rescheduled', `Appointment rescheduled to ${selectedTime}`);
      setSelectedAppointment(null);
      setSelectedTime(null);
      navigation.navigate('ViewMyBookings');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to reschedule appointment.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>RICHFIELD</Text>
      <Text style={styles.subtitle}>Digital queueing system</Text>
      <Text style={styles.title2}>Reschedule Appointment</Text>

      {appointments.length === 0 ? (
        <Text style={styles.noAppointments}>No appointments to reschedule.</Text>
      ) : (
        <>
          <Text style={styles.title3}>Select your appointment:</Text>
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.appointmentItem, selectedAppointment?.id === item.id && styles.selectedAppointment]}
                onPress={() => setSelectedAppointment(item)}
              >
                <Text style={styles.appointmentText}>
                  {item.queueNumber}. {item.department || 'Department'} - {item.timeSlot || 'Time'} 
                  {item.status === 'rescheduled' ? ' (Rescheduled)' : ''}
                </Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <Text style={styles.title4}>Select a new time slot:</Text>
      <View style={styles.timeSlotContainer}>
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[styles.timeSlotButton, selectedTime === slot && styles.selectedTimeSlot, isSlotDisabled(slot) && { backgroundColor: 'red' }]}
            onPress={() => !isSlotDisabled(slot) && setSelectedTime(slot)}
            disabled={isSlotDisabled(slot)}
          >
            <Text style={styles.timeSlotText}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button1} onPress={handleBooking}>
        <Text style={styles.buttonText1}>Confirm</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('StudentDashboardScreen')}>
        <Text style={styles.buttonText2}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', alignItems: 'center', paddingTop: 60 },
  logo: { width: 50, height: 50, marginRight: 330 },
  subtitle: { color: 'darkblue', fontSize: 10, marginRight: 100 },
  title: { fontSize: 30, marginTop: -40, marginLeft: -130, color: 'darkblue' },
  title2: { color: 'darkblue', fontSize: 24, marginTop: 50, marginRight: 100, fontWeight: 'bold' },
  title3: { color: 'darkblue', fontSize: 20, marginTop: 20 },
  title4: { color: 'darkblue', fontSize: 20 },
  appointmentItem: { backgroundColor: 'grey', padding: 15, borderRadius: 8, marginVertical: 5, width: 300 },
  selectedAppointment: { backgroundColor: 'green' },
  appointmentText: { color: 'white' },
  timeSlotContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, gap: 10 },
  timeSlotButton: { backgroundColor: 'grey', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, margin: 5 },
  selectedTimeSlot: { backgroundColor: 'green' },
  timeSlotText: { color: 'white' },
  button1: { width: 170, height: 60, marginTop: 50, marginLeft: 180, backgroundColor: 'green', paddingVertical: 12, borderRadius: 8 },
  buttonText1: { color: 'white', fontSize: 18, textAlign: 'center' },
  button2: { width: 170, height: 60, marginBottom: 50, marginTop: -60, marginRight: 180, backgroundColor: 'darkblue', paddingVertical: 12, borderRadius: 8 },
  buttonText2: { color: 'white', fontSize: 18, textAlign: 'center' },
  noAppointments: { color: 'darkblue', fontSize: 18, marginTop: 20 },
});
