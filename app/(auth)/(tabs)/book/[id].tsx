import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import React, { useState , useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Switch, ScrollView, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import { autoScroll } from '@shopify/flash-list';
export default function BookingScreen() {
  const { id, carData } = useLocalSearchParams();
  const car = JSON.parse(carData); // Parse the car data back into an object

  const [withDriver, setWithDriver] = useState(false);
  const router = useRouter();
  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [isPickupPickerVisible, setPickupPickerVisible] = useState(false);
  const [isReturnPickerVisible, setReturnPickerVisible] = useState(false);

  const handlePayment = () => {
    router.push({
      pathname: '/(auth)/(tabs)/book/payment'
    });
  };



  const handlePickupLocationPress = () => {
    router.push({
      pathname: '/(auth)/(tabs)/book/mapScreen',
      params: { onSelectLocation: (location) => setPickupLocation(location) },
    });
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
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const calculateDuration = () => {
    const diffInMs = returnDate - pickupDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${diffInDays} days, ${diffInHours} hours`;
  };
  const handleBack = () => {
    router.back();
  };

  const handleViewMoreDetails = () => {
    // Navigate to a car details screen or show a modal with more details
    alert('View more details about the car');
  };


  // const car = {
  //   name: 'Toyota RAV4',
  //   price: 'KES 3000/day',
  //   image: 'https://kai-and-karo.ams3.cdn.digitaloceanspaces.com/media/vehicles/images/IMG-20240306-WA0026.jpg',
  // };

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

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.featuresList}>
            {/* Dynamically render features from the car object */}
            {car.features.map((feature, index) => (
              <Text key={index} style={styles.feature}>
                {feature}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.buttonContainer} >
        {/* View More Details Button */}
        <TouchableOpacity style={styles.viewMoreButton} onPress={handleViewMoreDetails}>
          <Text style={styles.viewMoreButtonText}>View More</Text>
        </TouchableOpacity>
        <Ionicons name="information-circle-outline" size={24} color="#fff" />

        {/* Save for Later Button */}
        <TouchableOpacity style={styles.saveButton} onPress={() => alert('Saved for later')}>
          <Ionicons name="bookmark-outline" size={20} color="#fff" />
        </TouchableOpacity>
        </View>


        {/* Book with Driver */}
        <View style={styles.section}>
          <Text style={styles.label}>Book with driver</Text>
          <Switch value={withDriver} onValueChange={setWithDriver} />
        </View>

        {/* Pickup and Return Dates */}
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
              <Ionicons name="calendar" size={23} color="#000" style={styles.icon} />
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
          <Text style={styles.label}>Time left</Text>

         <View style={styles.durationContainer}>
          <Ionicons name="calendar" size={20} color="#000" />
          <Text style={styles.durationText}>{calculateDuration().split(' ')[0]} days</Text>
          <Ionicons name="time" size={20} color="#000" style={styles.durationIcon} />
          <Text style={styles.durationText}>{calculateDuration().split(' ')[2]} hours</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(calculateDuration().split(' ')[0] / 30) * 100}%` }]} />
        </View>

        <View style={styles.tooltipContainer}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.tooltipText}>Based on your selected dates</Text>
        </View>


        {/* Pickup Location */}
        {/* <Text style={styles.label}>Pickup Location</Text> */}
        <TouchableOpacity onPress={handlePickupLocationPress} style={styles.pickupLocationContainer}>
        <TextInput
          style={styles.inputlocation}
          placeholder="Pickup location"
          // value={pickupLocation}
          editable={false}
        />
        <Ionicons name="map" size={24} color="#000" style={styles.mapIcon} />
      </TouchableOpacity>
        {/* Booking Form */}
        {/* <Text style={styles.label}>Your Name</Text>
        <TextInput style={styles.input} placeholder="Enter your name" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} placeholder="Enter your phone number" keyboardType="phone-pad" />

       */}

        {/* Payment Button */}
        <TouchableOpacity style={styles.bookButton} onPress={handlePayment}>
          <Text style={styles.bookButtonText}>{car.price} |Pay Now</Text>
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
  viewMoreButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    marginTop:0,
    width: 100 ,
    height : 40,
  },
  viewMoreButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
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
    marginTop: 10,
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
    marginLeft: 5,
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
  featuresContainer: {
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  feature: {
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  insuranceOptions: {
    flexDirection: 'row',
  },
  insuranceButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  selectedInsurance: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  insuranceText: {
    color: '#000',
  },
  paymentOptions: {
    flexDirection: 'row',
  },
  paymentButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  selectedPayment: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  paymentText: {
    color: '#000',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsText: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  reviewsContainer: {
    marginBottom: 15,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  review: {
    fontSize: 14,
    marginBottom: 5,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#28A745',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 180,
    marginBottom: 15,
    marginTop:0,
    width: 5 ,
    height : 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  labelduration: {
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333', 
    backgroundColor: '#f0f0f0', 
    padding: 10, 
    borderRadius: 5, 
    marginBottom: 15,
    marginVertical: 10,
  },
 durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  durationText: {
    fontSize: 16,
    marginLeft: 5,
  },
  durationIcon: {
    marginLeft: 15,
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBar: {
    height: 5,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#000',
  },
  tooltipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tooltipText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  slider: {
    width: '100%',
    marginBottom: 15,
  },
  pickupLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    position: 'relative',
    marginBottom: 40,
     marginTop: 20,
  },
  inputlocation: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 25,
  },
  mapIcon: {
    position: 'absolute',
    marginLeft: 10

  },

});