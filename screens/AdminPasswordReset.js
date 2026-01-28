import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';

//IMPORT FIREBASE AUTHENTICATION TO SEND A PASSWORD RESET EMAIL
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './config/firebaseConfig'; 

export default function AdminResetPassword({ navigation }) {
  const [email, setEmail] = useState('');

//HANDLE PASSWORD RESET
  const handlePasswordReset = () => {
    if (!email) { 
      Alert.alert("Missing Field", "Please enter your email"); //CHECKS IF EMAIL IS ENTERED; ALERTS THE MESSAGE IF NOT
      return;
    }

    //IF EMAIL IS AVAILABLE, AND UTHENTICATED, A CONFIRMATION LINK IS SENT 
    sendPasswordResetEmail(auth, email) 
      .then(() => {
        console.log("Reset link sent to:", email);
        Alert.alert("Success", "Password reset email sent!");
        navigation.goBack(); 
      })
      .catch((error) => { //IF NOT SUCCESSFUL; ALERT MESSAGE FOR ERROR IS DISPLAYED
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
         <Image
             source={require('../assets/richfield_logo.jpg')}
            style={styles.logo}
         />
             <Text style={styles.title}>RICHFIELD</Text>
             <Text style={styles.subtitle}>Digital queueing system</Text>
      <Text style={styles.title2}>Forgot Password</Text>
      <Text style={styles.instructions}>Enter your email to receive a reset link.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="lightgrey"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

//STYLING SECTION
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'blue',
    flex: 1,
    padding: 24,
    justifyContent: 'center',

  },

  logo: {
    width: 50,
    height: 50,
    marginRight: 330,
    marginTop: -300
  
  },

  subtitle: {
    color: 'white',
    fontSize: 10,
   marginLeft: 80
    

  },


  title: {
    fontSize: 30,
    marginTop: -50,
    marginLeft: 60,
    color: 'white'
    
  },


  title2: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    marginTop: 50
  },

  instructions: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: 'white',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'darkblue'
  },
  button: {
    backgroundColor: 'grey',
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backText: {
    marginTop: 20,
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});
