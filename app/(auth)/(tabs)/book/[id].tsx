import { NavigationContainerRefContext } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import React, {useState} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BookingScreen() {
  //const { id } = useLocalSearchParams();
  // Sample car data for UI display
  const [withDriver, setWithDriver] = useState(false);
  const car = {
    name: 'Toyota RAV4',
    price: 'KES 3000/day',
    image: 'https://via.placeholder.com/150',
  };

  return (
    <View style={styles.container}>
        {/* <Text>Booking screen......{id}</Text> */}
        <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} />
        <Text style={styles.headerTitle}>Booking Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.activeStep]} />
        <View style={styles.progressStep} />
        <View style={styles.progressStep} />
      </View>

      {/* Car Details */}
      <Image source={{ uri: car.image }} style={styles.carImage} />
      <Text style={styles.carName}>{car.name}</Text>
      <Text style={styles.carPrice}>{car.price}</Text>

      {/* Book with Driver */}
      <View style={styles.section}>
        <Text style={styles.label}>Book with driver</Text>
        <Switch value={withDriver} onValueChange={setWithDriver} />
      </View>

      {/* Booking Form */}
      <Text style={styles.label}>Your Name</Text>
      <TextInput style={styles.input} placeholder="Enter your name" />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} placeholder="Enter your phone number" keyboardType="phone-pad" />
{/* 
      Gender Selection
      <View style={styles.genderContainer}>
        {['Male', 'Female', 'Others'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.genderButton, gender === option && styles.selectedGender]}
            onPress={() => setGender(option)}
          >
            <Text style={gender === option ? styles.selectedGenderText : styles.genderText}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}

      {/* Pickup and Return Dates */}
        {/* Date Selection (Mocked for now) */}
        <Text style={styles.label}>Select Dates</Text>

        <View style={styles.dateContainer}>
        <TextInput style={styles.input} placeholder="Pick-up Date" />
        <View style={styles.separator} />
        <TextInput style={styles.input} placeholder="Return Date" />
      </View>

      {/* Pickup Location */}
      <Text style={styles.label}>Pickup Location</Text>
      <TextInput style={styles.input} placeholder="Enter pickup location" />

      {/* Payment Button */}
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>KES 3000 | Pay Now</Text>
      </TouchableOpacity>
      </ScrollView >
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { 
        flex: 1, 
        padding: 20,
        backgroundColor: '#F9F9F9' },
  scrollContainer: { 
        padding: 0, 
        paddingBottom: 0 },
  header: { 
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20 },
  headerTitle: { 
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10 },
  progressContainer: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginBottom: 20 },
  progressStep: {
        width: 30,
        height: 5, 
        backgroundColor: '#ccc',
        marginHorizontal: 5,
        borderRadius: 5 },
  activeStep: { 
        backgroundColor: '#000' },
  carImage: {
        width: '100%',
        height: 100,
        borderRadius: 10,
        marginBottom: 10 },
  carName: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 5 },
  carPrice: { 
        fontSize: 18, 
        color: '#666',
        marginBottom: 15 },
  section: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 15 },
  label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4 },
  input: {
        flex : 1,
        height: 50,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10, 
        marginBottom: 15, 
        borderWidth: 1, 
        borderColor: '#ddd' },
  genderContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 15 },
  genderButton: {
        flex: 1, 
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 10,
        borderWidth: 1, 
        borderColor: '#ddd', 
        alignItems: 'center' },
  selectedGender: { 
        backgroundColor: '#000' },
  genderText: { 
        color: '#000' },
  dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width : "100%" },

  selectedGenderText: {
        color: '#fff', 
        fontWeight: 'bold' },
  bookButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center' },
  bookButtonText: { 
        color: '#fff', 
        fontSize: 18, 
        fontWeight: 'bold' },
 separator: {
        width: 1,
        height: '80%', 
        backgroundColor: '#ccc', 
        marginHorizontal: 10 },

});

