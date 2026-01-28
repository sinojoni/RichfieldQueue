import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDoc, doc, collection, getDocs, onSnapshot, setDoc, query, where } from 'firebase/firestore';
import { db, auth } from './config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function StudentDashboardScreen({ route, navigation }) {
  const routeUsername = route.params?.username;
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [maxStars] = useState(5);
  const [myNumber, setMyNumber] = useState(null);
  const [alertedPosition, setAlertedPosition] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Fetch username
  useFocusEffect(
    useCallback(() => {
      const fetchUsername = async () => {
        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;
          const userDocRef = doc(db, "users", uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          }
        }
      };

      if (routeUsername) {
        setUsername(routeUsername);
      } else {
        fetchUsername();
      }
    }, [route.params])
  );

  // Fetch bookings & queue number from Firestore (real user data)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'appointments'),
      where('uid', '==', user.uid) // ✅ make sure this field matches Firestore
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        console.log('No bookings found for this user.');
        setBookings([]);
        return;
      }

      const userBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort bookings by date (latest first)
      const sortedBookings = userBookings.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });

      setBookings(sortedBookings);
      if (sortedBookings.length > 0) setMyNumber(sortedBookings[0].queueNumber);

      console.log('Bookings fetched:', sortedBookings);
    });

    return () => unsubscribe();
  }, []);

  // Queue updates (alerts)
  useEffect(() => {
    if (!myNumber) return;

    const queueRef = doc(db, "queue", "status");
    const unsubscribeQueue = onSnapshot(queueRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const currentNumber = data.currentNumber;

        const position = myNumber - currentNumber;

        if (position === 3 && alertedPosition !== 3) {
          Alert.alert("Queue Update", "You are third in line.");
          setAlertedPosition(3);
        } else if (position === 2 && alertedPosition !== 2) {
          Alert.alert("Queue Update", "You are second in line.");
          setAlertedPosition(2);
        } else if (position === 1 && alertedPosition !== 1) {
          Alert.alert("Queue Update", "You are currently being served!");
          setAlertedPosition(1);
        }
      }
    });

    return () => unsubscribeQueue();
  }, [myNumber, alertedPosition]);

  // Rating
  const handleRating = async (value) => {
    setRating(value);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const ratingDocRef = doc(db, 'ratings', user.uid);
      await setDoc(ratingDocRef, { rating: value }, { merge: true });

      const ratingsCol = collection(db, 'ratings');
      const ratingsSnapshot = await getDocs(ratingsCol);
      const allRatings = ratingsSnapshot.docs
        .map(doc => doc.data().rating)
        .filter(r => typeof r === 'number' && r > 0);

      if (allRatings.length > 0) {
        const total = allRatings.reduce((sum, r) => sum + r, 0);
        setAvgRating((total / allRatings.length).toFixed(1));
      }

      Alert.alert(`Thank you! You rated the app ${value} star${value > 1 ? 's' : ''}.`);
    } catch (error) {
      console.log('Error saving rating:', error);
    }
  };

  // Logout
  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace("HomeScreen");
            } catch (error) {
              console.log("Logout error:", error.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ alignItems: 'center', paddingBottom: 50 }}>
      <View style={styles.header}>
        <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
        <View>
          <Text style={styles.title1}>RICHFIELD</Text>
          <Text style={styles.subtitle1}>Digital queueing system</Text>
          <Text style={styles.subtitle2}>Welcome, {username}!</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button2, { backgroundColor: 'green' }]}
        onPress={() => navigation.navigate('BookAppointment')}
      >
        <Text style={styles.buttonText2}>Book Appointment</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button1} onPress={() => navigation.navigate('CurrentQueueStatus')}>
        <Text style={styles.buttonText1}>Current Queue Status</Text>
      </TouchableOpacity>

      <View style={{ padding: 20, width: '100%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>My Bookings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={30} color="darkblue" />
          </TouchableOpacity>
        </View>

        {bookings.length === 0 ? (
          <Text style={{ color: 'red', fontSize: 20 }}>No bookings yet.</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
          
              <Text>Date: {booking.date}</Text>
             
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={() => navigation.navigate('ViewMyBookings', { bookingId: booking.id })}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={[styles.button6, { backgroundColor: 'darkgrey' }]} onPress={handleLogout}>
        <Text style={styles.buttonText6}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.ratingTitle}>Rate Our App</Text>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
          <TouchableOpacity key={star} onPress={() => handleRating(star)}>
            <Text style={[styles.star, rating >= star ? styles.filledStar : styles.emptyStar]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.avgRatingText}>Average Rating: {avgRating} / {maxStars}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: '20%', marginRight: '25%' },
  logo: { width: 50, height: 50, borderRadius: 10, marginRight: 10, marginBottom: '20%' },
  title1: { color: 'darkblue', fontSize: 20, fontWeight: 'bold' },
  subtitle2: { fontSize: 20, color: 'darkblue', marginTop: '10%', marginLeft: '20%' },
  subtitle1: { color: 'darkblue', fontSize: 15, marginBottom: 10 },
  ratingTitle: { color: 'darkblue', fontSize: 18, marginTop: 20, marginBottom: 10 },
  starsContainer: { flexDirection: 'row' },
  star: { fontSize: 40, marginHorizontal: 5 },
  filledStar: { color: 'darkblue' },
  emptyStar: { color: 'grey' },
  avgRatingText: { color: 'darkblue', fontSize: 16, marginTop: 10 },
  button1: { width: 250, height: 50, borderRadius: 20, backgroundColor: 'darkblue', marginTop: 10 },
  buttonText1: { color: 'white', fontSize: 20, marginLeft: 30, marginTop: 10 },
  button2: { width: 250, height: 50, borderRadius: 20, marginTop: 10, justifyContent: 'center', alignItems: 'center' },
  buttonText2: { color: 'white', fontSize: 20 },
  button6: { width: 180, height: 50, borderRadius: 20, marginTop: 20 },
  buttonText6: { color: 'white', fontSize: 20, marginLeft: 50, marginTop: 10 },
  bookingCard: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 5, borderRadius: 5 },
  viewDetailsButton: { backgroundColor: '#007bff', padding: 5, marginTop: 5, borderRadius: 5 },
});
