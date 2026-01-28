import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from './config/firebaseConfig';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const lastNotifiedId = useRef(null);

  useEffect(() => {
    if (!auth.currentUser) return;
      const notificationsQuery = query(
      collection(db, 'notifications'),
      where('uid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
      const fetchedNotifications = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setNotifications(fetchedNotifications);

      if (fetchedNotifications.length > 0) {
        const latest = fetchedNotifications[0];
        if (!latest.read && latest.id !== lastNotifiedId.current) {
          Alert.alert("Notification", latest.message);
          lastNotifiedId.current = latest.id;
        }
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  
  const handleClearNotifications = async () => {
    if (notifications.length === 0) {
      Alert.alert("Info", "No notifications to clear.");
      return;
    }

    Alert.alert(
      "Clear Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, clear",
          onPress: async () => {
            try {
              for (const notif of notifications) {
                await deleteDoc(doc(db, "notifications", notif.id));
              }
              setNotifications([]); 
              Alert.alert("Cleared", "All notifications deleted successfully!");
            } catch (error) {
              console.error("Error clearing notifications:", error);
              Alert.alert("Error", "Failed to clear notifications.");
            }
          },
        },
      ]
    );
  };

  
  const renderNotification = ({ item }) => {
    let bgColor = 'grey';
    if (item.status === 'served') bgColor = 'green'; 
    else if (item.status === 'missed') bgColor = 'red'; 
    else if (item.status === 'rescheduled') bgColor = 'orange';

    const appointmentNumber = item.appointmentNumber ? `#${item.appointmentNumber}` : '';

    return (
      <View style={[styles.notification, { backgroundColor: bgColor }]}>
        <Text style={styles.message}>
          {item.message.includes("Appointment")
            ? `Appointment ${appointmentNumber} - ${item.message}`
            : item.message}
        </Text>
        <Text style={styles.time}>
          {item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleString()
            : item.createdAt || 'Unknown time'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
      <Text style={styles.title2}>RICHFIELD</Text>
      <Text style={styles.subtitle}>Digital Queueing System</Text>
      <Text style={styles.title}>Notifications</Text>

      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StudentDashboardScreen')}>
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClearNotifications}>
          <Text style={styles.buttonText}>Clear Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: 'white',
  },
  logo: {
    marginTop: 60,
    width: 50,
    height: 50,
    marginRight: 330
  },
  subtitle: { 
    color: 'darkblue', 
    fontSize: 10,
    marginLeft: 80
  },
  title2: {
    fontSize: 30,
    marginTop: -50,
    marginLeft: 55,
    color: 'darkblue'
  },
  title: { 
    fontSize: 24,
    color: 'darkblue', 
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  notification: { 
    padding: 15, 
    marginTop: 15,
    borderRadius: 10
  },
  message: { 
    fontSize: 16, 
    color: 'white',
    fontWeight: '600'
  },
  time: {
    fontSize: 12,
    color: 'white',
    marginTop: 5
  },
  noNotifications: {
    color: 'darkblue', 
    fontSize: 16,
    marginTop: 40,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  button: {
    backgroundColor: 'darkblue',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  clearButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
