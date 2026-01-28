import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { doc, onSnapshot, setDoc, collection, query, where, updateDoc, addDoc } from 'firebase/firestore';
import { db } from './config/firebaseConfig';

export default function AdminTodaysAppointmentsScreen({ navigation }) {
  const [queueStatus, setQueueStatus] = useState('inactive');
  const [currentNumber, setCurrentNumber] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [queueStartTime, setQueueStartTime] = useState(null);
  const [pendingAlerts, setPendingAlerts] = useState([]); 

  const queueDocRef = doc(db, 'queueStatus', 'currentQueue');

  useEffect(() => {
    const unsubscribe = onSnapshot(queueDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const queueData = data.queueData || {};
        setQueueStatus(queueData.status || 'inactive');
        setCurrentNumber(queueData.currentNumber ?? 0);
        setQueueStartTime(queueData.startTime ?? null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!queueStartTime || queueStatus !== 'active') {
      setAppointments([]);
      return;
    }

    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('createdAt', '>=', queueStartTime));

    const unsubscribeAppointments = onSnapshot(q, (snapshot) => {
      const updatedAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const apptData = change.doc.data();
          if (apptData.status === 'cancelled' || apptData.status === 'rescheduled') {
            setPendingAlerts(prev => [...prev, apptData]);
          }
        }
      });

      const displayAppointments = updatedAppointments.sort((a, b) => a.queueNumber - b.queueNumber);
      setAppointments(displayAppointments);
    });

    return () => unsubscribeAppointments();
  }, [queueStartTime, queueStatus]);

  useEffect(() => {
    if (pendingAlerts.length > 0) {
      const alertAppt = pendingAlerts[0];
      Alert.alert(
        alertAppt.status === 'cancelled' ? 'Appointment Cancelled' : 'Appointment Rescheduled',
        `Student: ${alertAppt.studentName}\nDepartment: ${alertAppt.department}\nTime: ${alertAppt.timeSlot}`
      );
      setPendingAlerts(prev => prev.slice(1)); 
    }
  }, [pendingAlerts]);

  const startQueue = async () => {
    try {
      const startTime = new Date();
      await setDoc(queueDocRef, { queueData: { status: 'active', currentNumber: 1, startTime } }, { merge: true });
      setCurrentNumber(1);
      Alert.alert('Queue started and reset to number 1!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error starting queue', error.message);
    }
  };

  const stopQueue = async () => {
    try {
      await setDoc(queueDocRef, { queueData: { status: 'inactive', currentNumber: 0, startTime: null } }, { merge: true });
      setAppointments([]);
      Alert.alert('Queue stopped and reset!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error stopping queue', error.message);
    }
  };

  const serveNext = async () => {
    if (queueStatus !== 'active' || appointments.length === 0) {
      Alert.alert('No appointments to serve');
      return;
    }

    try {
      const nextAppt = appointments.find(a => a.status === 'pending' || a.status === 'rescheduled');
      if (!nextAppt) {
        Alert.alert('No more appointments to serve');
        return;
      }

      const nextNumber = nextAppt.queueNumber;
      setCurrentNumber(nextNumber);

      await setDoc(queueDocRef, { queueData: { status: 'active', currentNumber: nextNumber, startTime: queueStartTime } }, { merge: true });
      await updateDoc(doc(db, 'appointments', nextAppt.id), { status: 'served' });

      await addDoc(collection(db, 'notifications'), {
        uid: nextAppt.uid,
        message: `Your appointment at ${nextAppt.department} for ${nextAppt.timeSlot} has been served.`,
        status: 'served',
        read: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error serving next number', error.message);
    }
  };

  const markAsMissed = async (appt) => {
    try {
      await updateDoc(doc(db, 'appointments', appt.id), { status: 'missed' });
      await addDoc(collection(db, 'notifications'), {
        uid: appt.uid,
        message: `Your appointment at ${appt.department} for ${appt.timeSlot} was missed.`,
        status: 'missed',
        read: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error marking as missed', error.message);
    }
  };

  const remainingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'rescheduled').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
        <View>
          <Text style={styles.title2}>RICHFIELD</Text>
          <Text style={styles.subtitle}>Digital queueing system</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Today's Appointments</Text>

        <View style={styles.buttonGroup}>
          <Button title="Start Queue" onPress={startQueue} />
          <Button title="Stop Queue" onPress={stopQueue} />
          <Button title="Serve Next" onPress={serveNext} disabled={remainingAppointments === 0} />
        </View>

        <Text style={styles.title0}>Appointments in queue:</Text>

        {queueStatus === 'active' ? (
          appointments.length > 0 ? (
            appointments.map((appt) => {
              let statusLabel = '';
              let rowStyle = styles.appointmentRow;

              if (appt.status === 'rescheduled') {
                statusLabel = ' (Rescheduled)';
                rowStyle = { ...rowStyle, backgroundColor: '#fff3cd' }; // yellow
              }
              if (appt.status === 'cancelled') {
                statusLabel = ' (Cancelled)';
                rowStyle = { ...rowStyle, backgroundColor: '#666', opacity: 0.7 }; // grayed out
              }
              if (appt.status === 'missed') {
                statusLabel = ' (Missed)';
                rowStyle = { ...rowStyle, backgroundColor: '#666' };
              }
              if (appt.status === 'served') {
                statusLabel = ' (Served)';
                rowStyle = { ...rowStyle, backgroundColor: '#999' };
              }

              return (
                <View key={appt.id} style={rowStyle}>
                  <Text style={[
                    styles.appointmentText,
                    appt.status === 'served' || appt.status === 'missed' || appt.status === 'cancelled'
                      ? { textDecorationLine: 'line-through', color: 'white' } 
                      : null
                  ]}>
                    {appt.queueNumber}. {appt.department || 'Department'} - {appt.timeSlot || 'Time'}{statusLabel}
                  </Text>

                  {appt.status === 'pending' || appt.status === 'rescheduled' ? (
                    <TouchableOpacity
                      style={styles.missedButton}
                      onPress={() => markAsMissed(appt)}
                    >
                      <Text style={{ color: 'white' }}>Mark as Missed</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })
          ) : (
            <Text style={styles.noAppointments}>No appointments available</Text>
          )
        ) : (
          <Text style={styles.inactiveQueue}>Queue is currently inactive.</Text>
        )}

        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: 'darkblue' }]}
          onPress={() => navigation.navigate('AdminDashboardScreen')}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: 'white', 
    flex: 1, 
    padding: 20, 
    alignItems: 'center', 
  },
  scrollContainer: { 
    paddingBottom: 20, 
    width: '100%' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 40, 
    marginBottom: 20,
    marginRight: '50%' 
  },
  logo: { 
    width: 50, 
    height: 50, 
    marginRight: 10, 
    borderRadius: 10 
  },
  subtitle: { 
    color: 'darkblue', 
    fontSize: 12 
  },
  title0: { 
    color: 'darkblue', 
    fontSize: 18, 
    marginTop: 20, 
    marginBottom: 10, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  title: { 
    color: 'darkblue', 
    fontSize: 24, 
    marginTop: 10, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  buttonGroup: { 
    width: '100%', 
    marginTop: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  appointmentRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8, 
    padding: 10, 
    borderRadius: 10, 
    backgroundColor: '#d3d3d3' // light grey
  },
  appointmentText: { 
    color: 'darkblue', // dark blue text
    fontSize: 16, 
    flex: 1 
  },
  missedButton: { 
    backgroundColor: 'red', 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 5, 
    marginLeft: 10 
  },
  noAppointments: { 
    color: 'darkblue', 
    fontSize: 16, 
    marginTop: 20, 
    textAlign: 'center' 
  },
  inactiveQueue: { 
    color: 'darkblue', 
    marginTop: 20, 
    textAlign: 'center' 
  },
  backButton: { 
    width: '120', 
    height: 50, 
    marginTop: 30, 
    borderRadius: 10, 
    backgroundColor: 'darkblue', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  backButtonText: { 
    color: 'white', 
    fontSize: 18, 
   
  }
});
