import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { db, auth } from './config/firebaseConfig';
import { collection, query, where, onSnapshot, updateDoc, doc, Timestamp, addDoc } from 'firebase/firestore';

export default function CancelAppointment({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [queueStatus, setQueueStatus] = useState('inactive');
  const [queueStartTime, setQueueStartTime] = useState(null);

 
  useEffect(() => {
    const queueRef = doc(db, 'queueStatus', 'currentQueue');
    const unsubscribeQueue = onSnapshot(queueRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()?.queueData || {};
        setQueueStatus(data.status || 'inactive');
        setQueueStartTime(data.startTime || null);
      } else {
        setQueueStatus('inactive');
        setQueueStartTime(null);
      }
    });
   return () => unsubscribeQueue();
  }, []);

   useEffect(() => {
    if (!auth.currentUser) return;

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('uid', '==', auth.currentUser.uid),
      where('status', 'in', ['pending', 'rescheduled'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (queueStatus !== 'active' || !queueStartTime) {
        setAppointments([]); 
        return;
      }


      const today = new Date().toISOString().split('T')[0];
      const data = snapshot.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .filter(a =>
          a.date === today &&
          a.createdAt?.toDate() >= (queueStartTime?.toDate() || new Date(0))
        );

      setAppointments(data);
    });

    return () => unsubscribe();
  }, [queueStatus, queueStartTime]);

 
  const handleCancel = async () => {
    if (!selectedAppointment) {
      Alert.alert('No appointment selected', 'Please select an appointment to cancel.');
      return;
    }

    Alert.alert(
      'Confirm Cancellation',
      `Are you sure you want to cancel appointment ${selectedAppointment.queueNumber}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              
              await updateDoc(doc(db, 'appointments', selectedAppointment.id), {
                status: 'cancelled',
                updatedAt: Timestamp.now(),
              });

            const adminUid = 'obH1yKbP6eOEOWZa04Kpblpd3S03'; 
            await addDoc(collection(db, 'notifications'), {
              uid: adminUid,
              message: `Appointment ${selectedAppointment.queueNumber} has been cancelled by the student.`,
              status: 'pending',
              createdAt: Timestamp.now(),
              appointmentId: selectedAppointment.id,
              studentName: selectedAppointment.studentName || 'Student'
            });
            console.log("Admin notification sent successfully");



              await addDoc(collection(db, 'notifications'), {
                uid: auth.currentUser.uid,
                message: `You cancelled appointment ${selectedAppointment.queueNumber}.`,
                status: 'pending',
                createdAt: Timestamp.now(),
              });

              Alert.alert('Cancelled', 'Your appointment has been cancelled.');
              setSelectedAppointment(null);
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to cancel appointment.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>RICHFIELD</Text>
      <Text style={styles.subtitle}>Digital queueing system</Text>

      <Text style={styles.title2}>Cancel Appointment</Text>

      {queueStatus !== 'active' ? (
        <Text style={{ color: 'white', marginTop: 20 }}>Queue is closed. No appointments to cancel.</Text>
      ) : appointments.length === 0 ? (
        <Text style={{ color: 'white', marginTop: 20 }}>No appointments to cancel.</Text>
      ) : (
        <>
          <Text style={styles.text1}>Select an appointment to cancel:</Text>
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.appointmentItem,
                  selectedAppointment?.id === item.id && styles.selectedAppointment,
                ]}
                onPress={() => setSelectedAppointment(item)}
              >
                <Text style={styles.appointmentText}>
                  {item.queueNumber}. {item.department || 'Department'} - {item.timeSlot || 'Time'}
                  {item.status === 'rescheduled' ? ' (Rescheduled)' : ''}
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.button1} onPress={handleCancel}>
            <Text style={styles.buttonText1}>Cancel Selected</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('StudentDashboardScreen')}>
        <Text style={styles.buttonText2}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

//STYLING SECTION
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'blue',
    alignItems: 'center', 
    paddingTop: 60
 },
  logo: {
    width: 50,
    height: 50, 
    marginRight: 330 
},
  subtitle: { 
    color: 'white', 
    fontSize: 10,
    marginRight: 100
 },
  title: { 
    fontSize: 30,
    marginTop: -40,
    marginLeft: -130, 
    color: 'white' 
  },
  title2: { 
    fontSize: 24, 
    color: 'white',
     marginBottom: 20, 
     fontWeight: 'bold', 
     marginTop: 50, 
     marginRight: 150
},
  text1: { 
    color: 'white',
    fontSize: 15,
    marginTop: 10,
    marginRight: 50,
    marginBottom: 10
  },
  appointmentItem: { 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 8,
    marginVertical: 5,
    width: 300 
    },
  selectedAppointment: { 
    backgroundColor: 'blue'
   },
  appointmentText: {
    color: 'black',
    fontSize: 16 
    },
  button1: {
    width: 170,
    height: 60,
    marginTop: 20, 
    backgroundColor: 'red',
    paddingVertical: 12, 
    borderRadius: 8
       },
  buttonText1: { 
    color: 'white',
    fontSize: 18,
    textAlign: 'center'
     },
  button2: { 
    width: 170, 
    height: 60,
    marginTop: 20,
    backgroundColor: 'darkblue', 
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 50 
      },
  buttonText2: { 
    color: 'white',
    fontSize: 18,
    textAlign: 'center'
     },
});
 