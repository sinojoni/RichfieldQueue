import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function StudentSignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    const cleanedEmail = email.toLowerCase().trim();

    // ✅ Allow both @my.richfield.ac.za and @richfield.ac.za
    if (
      !cleanedEmail.endsWith('@my.richfield.ac.za')
    ) {
      Alert.alert("Invalid Email", "Please use your Richfield school email to sign up.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanedEmail, password);
      const user = userCredential.user;

      // ✅ Ensure Firestore write succeeds
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: cleanedEmail,
        uid: user.uid,
        role: "student"
      });
      console.log("Firestore doc written:", user.uid);

      Alert.alert("Success", "Account created!");
      navigation.navigate("StudentDashboardScreen", { username });

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Email In Use", "That email is already taken.");
      } else {
        Alert.alert("Error", error.message.replace("Firebase:", "").trim());
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>RICHFIELD</Text>
        <Text style={styles.subtitle}>Digital queueing system</Text>

        <Text style={styles.subtitle1}>Student Sign Up</Text>

        <TextInput
          style={styles.input1}
          placeholder="Username"
          placeholderTextColor="grey"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

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

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle2}>Already have an account?</Text>

        <TouchableOpacity
          style={[styles.button1, { backgroundColor: 'darkblue' }]}
          onPress={() => navigation.navigate('StudentSignInScreen')}
        >
          <Text style={styles.buttonText1}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Keep your styling exactly the same
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '100%',
  },
  logo: {
    width: 80,
    height: 80,
    marginTop: 100,
    marginRight: 250,
    borderRadius: 15
  },
  subtitle: {
    color: 'darkblue',
    marginLeft: 150
  },
  title: {
    fontSize: 50,
    marginTop: -80,
    marginLeft: 80,
    color: 'darkblue'
  },
  subtitle1: {
    color: 'darkblue',
    fontSize: 20,
    marginTop: 50
  },
  input1: {
    marginTop: 50,
    width: 300,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: 'lightgrey',
    color: 'darkblue'
  },
  input2: {
    marginTop: 20,
    width: 300,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: 'lightgrey',
    color: 'darkblue'
  },
  input3: {
    marginTop: 20,
    width: 300,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: 'lightgrey',
    color: 'darkblue'
  },
  button: {
    width: 300,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'green',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    marginLeft: 120,
    marginTop: 8,
    fontSize: 20
  },
  button1: {
    width: 300,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'green',
    marginTop: 20,
  },
  buttonText1: {
    color: 'white',
    marginLeft: 120,
    marginTop: 8,
    fontSize: 20
  },
  subtitle2: {
    color: 'darkblue',
    marginTop: 50
  }
});
