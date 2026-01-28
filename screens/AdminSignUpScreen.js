import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminSignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 
  const handleSignUp = async () => {
      if (!username || !email || !password) { 
        Alert.alert("Missing Info", "Please fill in all fields."); 
        return;
      }
  
      if (!email.includes('@')) {
        Alert.alert("Invalid Email", "Enter a valid email address.");
        return;
      }
  
      if (password.length < 6) { 
        Alert.alert("Weak Password", "Password must be at least 6 characters."); 
        return;
      }
  
      try { 
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        
   await setDoc(doc(db, "users", user.uid), {
    username: username,
    email: email,
    uid: user.uid,
    role: "admin"
  });
  
        Alert.alert("Success", "Account created!");
        navigation.navigate("AdminDashboardScreen", { username });
  
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert("Email In Use", "That email is already taken.");
        } else {
          Alert.alert("Error", error.message.replace("Firebase:", "").trim()); 
        }
      }
  };

  return (
   <View style={styles.container}>
            <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
            <Text style = {styles.title}>RICHFIELD</Text>
            <Text style = {styles.subtitle}>Digital queueing system</Text>

            <Text style = {styles.subtitle1}>Admin Sign Up</Text>

    <TextInput
        style={styles.input1}
        placeholder="Username"
        placeholderTextColor="grey"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input2}
        placeholder="Email"
        placeholderTextColor="grey"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input3}
        placeholder="Password"     
        placeholderTextColor="grey"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      
        <Text style={styles.link}>Already have an account?</Text>


  <TouchableOpacity
                  style = {[styles.button1, { backgroundColor: 'darkblue'}]}
                  onPress = {() => navigation.navigate('AdminSignInScreen')}
                >
                  <Text style = {styles.buttonText1}>Sign In</Text>
                </TouchableOpacity>
    </View>
  );
}

//STYLING SECTION
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20, 
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
 },

logo: {
    width: 80,
    height: 80,
    marginTop: 100,
    marginRight: 250,
    borderRadius: 10,
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
    marginTop: 50,
    marginLeft: '0%',
  },

  input1: {
    color: 'darkblue',
    marginTop: 50,
    width: 300,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: 'lightgrey',
    marginLeft: 30

  },

  input2: {
    color: 'darkblue',
    marginTop: 20,
    width: 300,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: 'lightgrey',
    marginLeft: 30
  },

  input3: {
    color: 'darkblue',
    marginTop: 20,
    width: 300,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    backgroundColor: 'lightgrey',
    marginLeft: 30

  },

  button: {
     width: 300,
    height: 50, 
    borderRadius: 10,
    backgroundColor: 'green',
    marginTop: 20,
    marginLeft: 30
    
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
    backgroundColor: 'darkblue',
    marginTop: 20,
    marginLeft: 30
  },

  buttonText1: {
    color: 'white',
    marginLeft: 120,
    marginTop: 8,
    fontSize: 20

  },

  link: {
    color: 'darkblue',
    marginLeft: 70,
    marginTop: 10
  }
});
