import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";

Mapbox.setAccessToken("sk.eyJ1Ijoia2Vsdmlud2FtYnVhc3llbmdvIiwiYSI6ImNtMzVyZW1pNjA3MXAyaXF5eDA4NnFnZTkifQ.M9kqRHZYlL4HMo_bWPbZNA");

const defaultCar = {
  image: require("../../../assets/images/car.jpg"),
  location: { latitude: -1.310148, longitude: 36.813936 },
  rules: ["No smoking", "Return with full tank", "Max speed: 120km/h"],
  pricePerDay: 50,
};

const defaultBooking = {
  startDate: "2025-03-01",
  endDate: "2025-03-10",
  totalAmount: 500,
  amountPaid: 200,
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getDaysRemaining = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  return Math.max(Math.ceil((end - today) / (1000 * 60 * 60 * 24)), 0);
};

const BookingDetails = () => {
  const [daysRemaining, setDaysRemaining] = useState(getDaysRemaining(defaultBooking.endDate));
  const [remainingAmount, setRemainingAmount] = useState(Math.max(defaultBooking.totalAmount - defaultBooking.amountPaid, 0));

  useEffect(() => {
    setDaysRemaining(getDaysRemaining(defaultBooking.endDate));
  }, []);

  return (
    <View style={styles.container}>
      <Image source={defaultCar.image} style={styles.carImage} />
      
      <View style={styles.card}>
        <Text style={styles.dateText}>{formatDate(defaultBooking.startDate)} - {formatDate(defaultBooking.endDate)}</Text>
        
        {/* Rental Rules */}
        <Text style={styles.heading}>Rental Rules</Text>
        {defaultCar.rules.map((rule, index) => (
          <Text key={index} style={styles.ruleText}>• {rule}</Text>
        ))}
        
        {/* Days & Rent Remaining */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Days Remaining: <Text style={styles.bold}>{daysRemaining}</Text></Text>
          <Text style={styles.infoText}>Remaining Rent: <Text style={styles.bold}>${remainingAmount.toFixed(2)}</Text></Text>
        </View>
      </View>
      
      {/* Mapbox Location */}
      <View style={styles.mapContainer}>
        <MapView style={styles.map}>
          <Camera centerCoordinate={[defaultCar.location.longitude, defaultCar.location.latitude]} zoomLevel={14} />
          <PointAnnotation id="car-location" coordinate={[defaultCar.location.longitude, defaultCar.location.latitude]} />
        </MapView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "white" },
  carImage: { width: "100%", height: 220, borderRadius: 12, marginBottom: 12 },
  card: { backgroundColor: "grey", padding: 16, borderRadius: 12, marginBottom: 16 },
  dateText: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  heading: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  ruleText: { fontSize: 14, color: "#BBB", marginBottom: 4 },
  infoBox: { marginTop: 12 },
  infoText: { fontSize: 16, color: "#fff", marginBottom: 6 },
  bold: { fontWeight: "bold", color: "#FFD700" },
  mapContainer: { height: 200, borderRadius: 12, overflow: "hidden" },
  map: { flex: 1 },
});

export default BookingDetails;
