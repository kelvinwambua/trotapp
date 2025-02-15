import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from "react-native";

interface Car {
  id: number;
  name: string;
  price: string;
  image: string; // URL to car image
  type: string; // Car type (e.g., Sedan, SUV)
  distance: string; // Distance from user
}

interface CarSuggestionProps {
  location: {
    latitude: number;
    longitude: number;
  };
  cars: Car[];
}

const CarSuggestion = ({ location, cars }: CarSuggestionProps) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedCar, setSelectedCar] = useState<number>(cars[0].id); // Default to first car

  const handleSelectCar = (carId: number) => {
    setSelectedCar(carId);
  };

  return (
    <Animated.View style={[styles.container, expanded && styles.expanded]}>
      {/* Header */}
      <Text style={styles.title}>Car Rentals Near You</Text>

      {/* Default Car Option */}
      <TouchableOpacity
        style={[styles.defaultCar, selectedCar === cars[0].id && styles.selectedCar]}
        onPress={() => handleSelectCar(cars[0].id)}
      >
        <Image source={{ uri: cars[0].image }} style={styles.carImage} />
        <View style={styles.carDetails}>
          <Text style={styles.carName}>{cars[0].name}</Text>
          <Text style={styles.carType}>{cars[0].type}</Text>
          <Text style={styles.carDistance}>{cars[0].distance} away</Text>
        </View>
        <Text style={styles.carPrice}>{cars[0].price}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.moreOptions}>
          {cars.slice(1).map((car) => (
            <TouchableOpacity
              key={car.id}
              style={[styles.option, selectedCar === car.id && styles.selectedCar]}
              onPress={() => handleSelectCar(car.id)}
            >
              <Image source={{ uri: car.image }} style={styles.optionImage} />
              <View style={styles.optionDetails}>
                <Text style={styles.optionName}>{car.name}</Text>
                <Text style={styles.optionType}>{car.type}</Text>
                <Text style={styles.optionDistance}>{car.distance} away</Text>
              </View>
              <Text style={styles.optionPrice}>{car.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Toggle Button */}
      <TouchableOpacity style={styles.button} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.buttonText}>
          {expanded ? "Show Less" : `Explore ${cars.length - 1} More Options`}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  expanded: {
    minHeight: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    alignSelf: "center",
  },
  defaultCar: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 1,
    padding: 5,
    borderRadius: 10,
  },
  selectedCar: {
    borderWidth: 1.5,
    borderColor: "#007bff",
    backgroundColor: "#f0f8ff", // Light blue highlight
  },
  carImage: {
    width: 65,
    height: 55,
    borderRadius: 5,
    marginRight: 10,
  },
  carDetails: {
    flex: 1,
  },
  carName: {
    fontSize: 14,
    fontWeight: "600",
  },
  carType: {
    fontSize: 14,
    color: "#666",
  },
  carDistance: {
    fontSize: 12,
    color: "#888",
  },
  carPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  moreOptions: {
    marginTop: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 10,
    borderRadius: 10,
  },
  optionImage: {
    width: 65,
    height: 55,
    borderRadius: 5,
    marginRight: 10,
  },
  optionDetails: {
    flex: 1,
  },
  optionName: {
    fontSize: 14,
    fontWeight: "600",
  },
  optionType: {
    fontSize: 12,
    color: "#666",
  },
  optionDistance: {
    fontSize: 12,
    color: "#888",
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CarSuggestion;
