import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';

export default function AdminSignIn({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Dummy admin data
  const dummyAdmins = [
    { email: 'admin@richfield.ac.za', password: 'admin123', username: 'Denilla' }
  ];

  const handleSignIn = () => {
    const found = dummyAdmins.find(a => a.email === email.trim() && a.password === password);
    if (found) {
      navigation.navigate('AdminDashboardScreen', { username: found.username });
    } else {
      Alert.alert('Error', 'Incorrect email or password');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>RICHFIELD</Text>
        <Text style={styles.subtitle}>Digital queueing system</Text>
        <Text style={styles.subtitle1}>Admin Sign In</Text>

        <TextInput
          style={styles.input}
          placeholder="admin@richfield.ac.za"
          placeholderTextColor="grey"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="grey"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={false}
        />

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
  },
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  logo: { width: 80, height: 80, marginBottom: 20, borderRadius: 10 },
  title: { fontSize: 40, color: 'darkblue', marginBottom: 5 },
  subtitle: { color: 'darkblue', fontSize: 16, marginBottom: 20 },
  subtitle1: { color: 'darkblue', fontSize: 20, marginBottom: 20 },
  input: { width: 300, height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, color: 'darkblue', backgroundColor: 'lightgrey' },
  button: { width: 300, height: 50, borderRadius: 10, backgroundColor: 'green', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: 'white', fontSize: 20 }
});
