import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './config/firebaseConfig';
import { getDoc, doc } from "firebase/firestore";

export default function StudentSignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter email and password");
      return;
    }

    const cleanedEmail = email.toLowerCase().trim();

    if (
      !cleanedEmail.endsWith('@my.richfield.ac.za')
    ) {
      Alert.alert("Invalid Email", "Please use your Richfield school email.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Sign in
      const userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, password);
      const user = userCredential.user;
      console.log("Signed in user:", user.uid, user.email); // Debug

      // ✅ Get Firestore doc
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const username = userDoc.data().username;
        console.log("Username:", username);
        setLoading(false);
        navigation.navigate('StudentDashboardScreen', { username });
      } else {
        setLoading(false);
        Alert.alert("Error", "User data couldn't be fetched from Firestore");
      }

    } catch (error) {
      setLoading(false);
      console.log("Sign-in error:", error);
   if (error.code === 'auth/invalid-credential') {
  Alert.alert('Error', 'Incorrect password. Please try again.');
} else if (error.code === 'auth/user-not-found') {
  Alert.alert('Error', 'No account found with this email. Please register first.');
} else if (error.code === 'auth/too-many-requests') {
  Alert.alert('Account temporarily locked', 'Too many failed attempts. Please try again later.');
} else if (error.code === 'auth/network-request-failed') {
  Alert.alert('Network Error', 'Please check your internet connection.');
} else {
  Alert.alert('Sign-in Failed', 'Something went wrong. Please try again.');
} 
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>RICHFIELD</Text>
        <Text style={styles.subtitle}>Digital queueing system</Text>
        <Text style={styles.subtitle1}>Student Sign In</Text>

        <TextInput
          style={styles.input2}
          placeholder="studentnumber@my.richfield.ac.za"
          placeholderTextColor="grey"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input3}
          placeholder="Password"
          placeholderTextColor="grey"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={false}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
          {loading && <ActivityIndicator size="large" color="white" style={{ marginTop: 20 }} />}
        </TouchableOpacity>

        <Text style={styles.subtitle2}>Forgot Password?</Text>

        <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.buttonText2}>Reset Password.</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Keep your styling unchanged
const styles = StyleSheet.create({
  container: { backgroundColor: 'white', flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: '100%' },
  logo: { width: 80, height: 80, marginTop: '50%', marginRight: 250, borderRadius: 15 },
  subtitle: { color: 'darkblue', marginLeft: 150 },
  title: { fontSize: 50, marginTop: -80, marginLeft: 80, color: 'darkblue' },
  subtitle1: { color: 'darkblue', fontSize: 20, marginTop: 50, marginRight: '0%' },
  subtitle2: { color: 'darkblue', fontSize: 20, marginTop: 50, marginRight: '25%' },
  input2: { marginTop: 50, width: 300, height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 15, backgroundColor: 'lightgrey', marginLeft: 30, color: 'darkblue' },
  input3: { marginTop: 20, width: 300, height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, fontSize: 15, backgroundColor: 'lightgrey', marginLeft: 30, color: 'darkblue' },
  button: { width: 300, height: 50, borderRadius: 10, backgroundColor: 'green', marginTop: 20, marginLeft: 30 },
  buttonText: { color: 'white', marginLeft: 120, marginTop: 8, fontSize: 20 },
  button2: { marginLeft: 210, marginTop: -22, color: 'grey', fontSize: 20 },
  buttonText2: { color: 'grey', fontSize: 20, marginLeft: '0%' },
});

