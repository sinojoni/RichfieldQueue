import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { db } from './config/firebaseConfig';

export default function CurrentQueueStatus({ navigation }) {
  const [queueData, setQueueData] = useState({ status: 'inactive', currentNumber: 0, startTime: null });
  const [appointments, setAppointments] = useState([]);

  // Listen to queue status
  useEffect(() => {
    const queueRef = doc(db, 'queueStatus', 'currentQueue');
    const unsubscribeQueue = onSnapshot(queueRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const qData = data.queueData || { status: 'inactive', currentNumber: 0, startTime: null };
        setQueueData(qData);

        if (qData.status === 'inactive') setAppointments([]); // clear appointments when queue stops
      }
    });
    return () => unsubscribeQueue();
  }, []);

  // Listen to today's appointments
  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const unsubscribeAppointments = onSnapshot(appointmentsRef, (snapshot) => {
      const today = new Date().toISOString().split('T')[0];

      const filtered = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(a => a.date === today);

      setAppointments(filtered.sort((a, b) => a.queueNumber - b.queueNumber));
    });
    return () => unsubscribeAppointments();
  }, []);

  const isActive = queueData.status === 'active';
  const currentNumber = queueData.currentNumber || 0;
  const currentAppointment = appointments.find(a => a.queueNumber === currentNumber);
  const nextInLine = appointments.filter(a => a.queueNumber > currentNumber);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', paddingBottom: 50 }}>
      <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>RICHFIELD</Text>
      <Text style={styles.subtitle}>Digital queueing system</Text>

      <Text style={styles.title2}>Queue Status</Text>
      <Text style={styles.title3}>Queue is currently: {isActive ? 'Active' : 'Inactive'}</Text>

      {isActive && (
        <>
          <Text style={styles.label}>Currently Serving:</Text>
          <Text style={styles.bigNumber}>
            {currentAppointment ? `${currentAppointment.queueNumber} at ${currentAppointment.timeSlot}` : currentNumber}
          </Text>

          <Text style={styles.subTitle}>Next in Line:</Text>
          {nextInLine.length > 0 ? (
            nextInLine.map((appt) => (
              <Text key={appt.id} style={styles.listItem}>
                • {appt.queueNumber}
              </Text>
            ))
          ) : (
            <Text style={styles.listItem}>No upcoming appointments</Text>
          )}
        </>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'darkblue' }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', flex: 1, padding: 20 },
  logo: { width: 50, height: 50, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 30, color: 'darkblue', fontWeight: 'bold' },
  subtitle: { color: 'darkblue', fontSize: 15, marginBottom: 10 },
  title2: { fontSize: 24, color: 'darkblue', marginTop: 20, fontWeight: 'bold' },
  title3: { fontSize: 18, marginTop: 10, color: 'darkblue' },
  label: { fontSize: 18, color: 'darkblue', marginTop: 15 },
  bigNumber: { fontSize: 24, fontWeight: 'bold', color: 'green', marginTop: 5 },
  subTitle: { fontSize: 18, color: 'darkblue', marginTop: 15 },
  listItem: { fontSize: 16, color: 'darkblue', marginVertical: 3 },
  button: { width: 120, height: 50, borderRadius: 10, marginTop: 30, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18 }
});

