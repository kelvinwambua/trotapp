import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView,Linking } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Mapbox, { MapView, Camera, PointAnnotation, ShapeSource, LineLayer } from "@rnmapbox/maps";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location"

Mapbox.setAccessToken("sk.eyJ1Ijoia2Vsdmlud2FtYnVhc3llbmdvIiwiYSI6ImNtMzVyZW1pNjA3MXAyaXF5eDA4NnFnZTkifQ.M9kqRHZYlL4HMo_bWPbZNA");

const defaultCar = {
  image: require("../../../assets/images/car.jpg"),
  location: { latitude: -1.310148, longitude: 36.813936 },
  rules: ["No smoking", "Return with full tank", "Max speed: 120km/h"],
  pricePerDay: 2000,
};

const defaultBooking = {
  startDate: "2025-03-01",
  endDate: "2025-03-10",
  totalAmount: 25000,
  amountPaid: 0,
};

const defaultRenter={
  name:'Mark Makali',
  phone:"+254728874826",
  email:"smusangi54@gmail.com",
  image:require("../../../assets/images/renter.jpg")
}

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getDaysRemaining = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  return Math.max(Math.ceil((end - today) / (1000 * 60 * 60 * 24)), 0);
};

const BookingDetails = () => {
  const [endDate, setEndDate] = useState(new Date(defaultBooking.endDate));
  const [daysRemaining, setDaysRemaining] = useState(getDaysRemaining(endDate));
  const [remainingAmount, setRemainingAmount] = useState(
    Math.max(defaultBooking.totalAmount - defaultBooking.amountPaid, 0)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userLocation, setUserLocation]= useState(null)
  const [route,setRoute]=useState(null)

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to view the route.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      fetchRoute(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchRoute = async (userLat, userLng) => {
    const carLat = defaultCar.location.latitude;
    const carLng = defaultCar.location.longitude;
    const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${carLng},${carLat}?geometries=geojson&access_token=sk.eyJ1Ijoia2Vsdmlud2FtYnVhc3llbmdvIiwiYSI6ImNtMzVyZW1pNjA3MXAyaXF5eDA4NnFnZTkifQ.M9kqRHZYlL4HMo_bWPbZNA`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.routes.length > 0) {
        setRoute(data.routes[0].geometry);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };




  useEffect(() => {
    setDaysRemaining(getDaysRemaining(endDate));
  }, [endDate]);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setEndDate(selectedDate);
      const extraDays = getDaysRemaining(selectedDate) - getDaysRemaining(defaultBooking.endDate);
      const extraCost = extraDays > 0 ? extraDays * defaultCar.pricePerDay : 0;
      setRemainingAmount(defaultBooking.totalAmount - defaultBooking.amountPaid + extraCost);
    }
    setShowDatePicker(false);
  };

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={false} keyboardShouldPersistTaps="handled">
      <Image source={defaultCar.image} style={styles.carImage} />
      <Text style={styles.mapTitle}>Car Pickup Location</Text>
      <View style={styles.mapContainer}>
      <MapView style={styles.map} scrollEnabled={true} zoomEnabled={true} pitchEnabled={true}>
          <Camera centerCoordinate={[defaultCar.location.longitude, defaultCar.location.latitude]} zoomLevel={14} />

          {userLocation && (
            <PointAnnotation id="user-location" coordinate={[userLocation.longitude, userLocation.latitude]}>
              <View style={styles.userMarker} />
            </PointAnnotation>
          )}

          <PointAnnotation id="car-location" coordinate={[defaultCar.location.longitude, defaultCar.location.latitude]} />

          {route && (
            <ShapeSource id="routeSource" shape={route}>
              <LineLayer id="routeLayer" style={styles.routeLine} />
            </ShapeSource>
          )}
        </MapView>
      </View>
      
      <View style={[styles.card, { marginTop: 10 }]}> 
        <Text style={styles.dateText}>{formatDate(new Date(defaultBooking.startDate))} - {formatDate(endDate)}</Text>
        
        <Text style={styles.heading}>Rental Rules</Text>
        {defaultCar.rules.map((rule, index) => (
          <Text key={index} style={styles.ruleText}>• {rule}</Text>
        ))}

        <Text style={styles.heading}>Renter Contact</Text>
          <View style={styles.rentContainer}>
            <Image source={defaultRenter.image} style={styles.renterImage}/>
            <Text style={styles.infoText}>Name: <Text style={styles.bold}>{defaultRenter.name}</Text></Text>
            <Text style={styles.infoText}>Email: <Text style={styles.bold}>{defaultRenter.email}</Text></Text>
            <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL(`tel:${defaultRenter.phone}`)}>
              <MaterialIcons name="phone" size={20} color={'white'} style={{marginRight:5}}></MaterialIcons>
              <Text style={styles.callButtonText}>Call Renter</Text>
            </TouchableOpacity>
          </View>

        <View style={styles.divider}/>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Days Remaining: <Text style={styles.bold}>{daysRemaining}</Text></Text>
          <Text style={styles.infoText}>Remaining Rent: <Text style={styles.bold}>Kes {remainingAmount.toFixed(2)}</Text></Text>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.buttonText}>Extend Booking</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={new Date(defaultBooking.endDate)}
            onChange={handleDateChange}
          />
        )}
      </View>
      
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5" 
  },
  carImage: { 
    width: "100%", 
    height: 220, 
    marginBottom: 12 
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  mapTitle:{
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
    color: "#333",
    marginHorizontal: 16,
    marginBottom: 6,
  },
  dateText: { 
  color: "#333", 
  marginBottom: 10, 
  fontSize: 16, 
  fontFamily: "DMSans_700Bold" 
},
  heading: { 
  color: "#333", 
  marginBottom: 8, 
  fontSize: 16, 
  fontFamily: "DMSans_700Bold" 
},
  ruleText: { 
  fontSize: 14, 
  color: "#666", 
  marginBottom: 4, 
  fontFamily: "DMSans_400Regular" 
},
  infoBox: { 
  marginTop: 12 
},
  infoText: { 
    fontSize: 16, 
    fontFamily: "DMSans_400Regular", 
    color: "#444", 
    marginBottom: 6 
  },
  bold: { 
    fontWeight: "bold", 
    color: "#007AFF" 
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
  },
  mapContainer: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    margin: 16,
    borderWidth: 1,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  map: { 
    flex: 1, 
    borderRadius: 16 
  },
  divider: {
    height: 1,
    backgroundColor: "#007AFF",
    marginVertical: 10,
  },
  callButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    width: 160, 
    alignSelf: "flex-start",
  },
  callButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "DMSans_700Bold",
  },
  userMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "blue",
    borderWidth: 2,
    borderColor: "white",
  },
  routeLine: {
    lineWidth: 4,
    lineColor: "#007AFF",
    lineOpacity: 0.8,
  },
  renterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  renterImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "black",
  },
  
});

export default BookingDetails;
