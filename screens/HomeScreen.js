import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
        <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
       <Text style={styles.title}>Welcome to RichfieldQueue!</Text>
       <Text style={styles.title2}>Sign In or Sign Up as: </Text>

         <TouchableOpacity
        style={[styles.button1, { backgroundColor: 'darkblue', color: 'blue' }]}
        onPress={() => navigation.navigate('StudentSignUpScreen')}
      >
        <Text style={styles.buttonText1}>Student</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button2, { backgroundColor: 'darkblue' }]}
        onPress={() => navigation.navigate('AdminSignInScreen')}
      >
        <Text style={styles.buttonText2}>Administrator</Text>
      </TouchableOpacity>
      
    </View>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: 'darkblue',
    fontSize: 20,
    marginTop: 10,
    marginBottom: 50,
    fontWeight: 'bold'
  },

  title2: {
    color: 'darkblue',
    marginTop: -10,
    fontSize: 20,
    marginBottom: 50,
    fontWeight: 'bold'
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
    color: 'white',
    borderRadius: 15,
  },

  button1: {
    width: 300,
    height: 50, 
    borderRadius: 10,
    backgroundColor: 'darkblue',
    marginTop:-30
    
  },

  buttonText1: {
    color: 'white',
    marginLeft: 120,
    marginTop: 8,
    fontSize: 20

  },
  
  button2: {
    width: 300,
    height: 50, 
    borderRadius: 10,
    backgroundColor: 'darkblue',
    marginTop: 10
  },

  buttonText2: {
    color: 'white',
    marginLeft: 95,
    marginTop: 8,
    fontSize: 20
  }
});
