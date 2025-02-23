import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const [withDriver, setWithDriver] = useState(false);
  const router = useRouter();
  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [isPickupPickerVisible, setPickupPickerVisible] = useState(false);
  const [isReturnPickerVisible, setReturnPickerVisible] = useState(false);

  const handlePayment = () => {
    router.push('/(auth)/(tabs)/(profile)/payment/index');
  };

  const handlePickupDateConfirm = (selectedDate) => {
    setPickupPickerVisible(false);
    if (selectedDate) {
      setPickupDate(selectedDate);
    }
  };

  const handleReturnDateConfirm = (selectedDate) => {
    setReturnPickerVisible(false);
    if (selectedDate) {
      setReturnDate(selectedDate);
    }
  };

  const formatDateTime = (date) => {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour:'2-digit',
      minute : '2-digit',

    })}`;
  };

  const handleBack = () => {
    router.back();
  };

  const car = {
    name: 'Toyota RAV4',
    price: 'KES 3000/day',
    image: 'https://kai-and-karo.ams3.cdn.digitaloceanspaces.com/media/vehicles/images/IMG-20240306-WA0026.jpg',
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Booking Details',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
          animation: 'slide_from_right',
        }}
      />

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

        {/* Pickup and Return Dates */}
        {/* <Text style={styles.label}>Select Dates</Text> */}
        <View style={styles.dateContainer}>
            
          {/* Pickup Date */}
          <View style={styles.dateInputContainer}>
           <Text style={styles.dateLabel}>Pickup Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setPickupPickerVisible(true)}
          >
            <TextInput
              style={styles.dateTextInput}
              placeholder="Pick-up Date"
              value={formatDateTime(pickupDate)}
              editable={false}
            />
            <Ionicons name="calendar" size={22} color="#000" style={styles.icon} />
          </TouchableOpacity>
          </View>

          {/* Separator */}
          <View style={styles.separator} />

      {/* Return Date */}
            <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Return Date</Text>
            <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setReturnPickerVisible(true)}
            >
                  <TextInput
                  style={styles.dateTextInput}
                  placeholder="Select date"
                  value={formatDateTime(returnDate)}
                  editable={false}
                  />
                  <Ionicons name="calendar" size={22} color="#000" style={styles.icon} />
            </TouchableOpacity>
            </View>
      </View>

        {/* Date/Time Pickers */}
        <DateTimePickerModal
          isVisible={isPickupPickerVisible}
          mode="datetime"
          onConfirm={handlePickupDateConfirm}
          onCancel={() => setPickupPickerVisible(false)}
        />

        <DateTimePickerModal
          isVisible={isReturnPickerVisible}
          mode="datetime"
          onConfirm={handleReturnDateConfirm}
          onCancel={() => setReturnPickerVisible(false)}
        />

        {/* Pickup Location */}
        <Text style={styles.label}>Pickup Location</Text>
        <TextInput style={styles.input} placeholder="Enter pickup location" />
         
        {/* Booking Form */}
        <Text style={styles.label}>Your Name</Text>
        <TextInput style={styles.input} placeholder="Enter your name" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} placeholder="Enter your phone number" keyboardType="phone-pad" />


        {/* Payment Button */}
        <TouchableOpacity style={styles.bookButton} onPress={handlePayment}>
          <Text style={styles.bookButtonText}>KES 3000 | Pay Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  scrollContainer: {
    padding: 0,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressStep: {
    width: 30,
    height: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeStep: {
    backgroundColor: '#000',
  },
  carImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  carName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  carPrice: {
    fontSize: 18,
    color: '#666',
    marginBottom: 15,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 10,
      marginTop:10,
    },
    dateInputContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 10,
      padding: 10,
    },
    dateLabel: {
      position: 'absolute',
      top: -10,
      left: 10,
      backgroundColor: '#F9F9F9',
      paddingHorizontal: 5,
      fontSize: 12,
      color: '#666',
    },
    dateInput: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateTextInput: {
      flex: 1,
      height: 40,
      paddingVertical: 10,
      fontSize: 16,
    },
    icon: {
      marginLeft:5,
    },
    separator: {
      width: 2,
      height: '100%',
      backgroundColor: '#ccc',
      marginHorizontal: 10,
    },
  bookButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});