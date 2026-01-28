import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from './config/firebaseConfig';
import { BarChart } from 'react-native-chart-kit';

export default function BookingStats({ navigation }) {
  const [stats, setStats] = useState({});

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const now = new Date();
    const sevenDaysAgo = Timestamp.fromDate(new Date(now.setDate(now.getDate() - 7)));

    const q = query(collection(db, 'appointments'), where('createdAt', '>=', sevenDaysAgo));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = {};
      snapshot.docs.forEach(doc => {
        const appt = doc.data();
        const dept = appt.department;
        if (!dept) return; // skip missing department
        if (!data[dept]) data[dept] = 0;
        data[dept] += 1;
      });
      setStats(data);
    });

    return () => unsubscribe();
  }, []);

  const departments = Object.keys(stats).filter(d => d && d !== 'Unknown');
  const counts = departments.map(d => stats[d]);

  const chartWidth = Math.max(screenWidth * 1.1, departments.length * 90);
  const chartHeight = 400;

  const chartData = {
    labels: departments,
    datasets: [{ data: counts }]
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/richfield_logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>RICHFIELD</Text>
      <Text style={styles.subtitle}>Digital Queueing System</Text>

      <Text style={styles.text1}>Student Visits per Department (Last 7 Days)</Text>

      {departments.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, marginTop: 20 }}
        >
          <View style={styles.chartContainer}>
            <BarChart
              data={chartData}
              width={chartWidth}
              height={chartHeight}
              fromZero
              showValuesOnTopOfBars
              verticalLabelRotation={30}
              chartConfig={{
                backgroundColor: '#d3d3d3',
                backgroundGradientFrom: '#d3d3d3',
                backgroundGradientTo: '#d3d3d3',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 139, ${opacity})`, // dark blue bars
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForLabels: { fontSize: 12 },
                propsForBackgroundLines: { strokeWidth: 0 },
              }}
              withInnerLines={false}
            />
          </View>
        </ScrollView>
      ) : (
        <Text style={{ color: 'darkblue', fontSize: 16, marginTop: 20 }}>
          No appointments in the last 7 days
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'darkblue' }]}
        onPress={() => navigation.navigate('AdminDashboardScreen')}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 30,
    color: 'darkblue',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: 'darkblue',
    marginBottom: 20,
  },
  text1: {
    color: 'darkblue',
    fontSize: 18,
    marginTop: 10,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#d3d3d3',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  button: {
    width: 150,
    height: 50,
    borderRadius: 10,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
  },
});


