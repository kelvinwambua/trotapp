import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Pressable } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, router } from "expo-router";


interface LocationType {
  latitude: number;
  longitude: number;
}

interface ProcessedCar {
  id: string;
  name: string;
  price: string;
  image: string;
  type: string;
  distance: string;
  features: string[];
  fuelType?: string;
  location: string;
  description: string;
  coordinates: LocationType;
}

interface CarBottomSheetProps {
  location: LocationType;
  cars: ProcessedCar[];
  bottomSheetRef: React.RefObject<BottomSheet>;
}

const BOOK_BUTTON_HEIGHT = 70;

const CarBottomSheet = ({ location, cars, bottomSheetRef }: CarBottomSheetProps) => {
  const [selectedCar, setSelectedCar] = React.useState<string>(cars[0]?.id || '');
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);
  const insets = useSafeAreaInsets();
console.log(cars[0].image||"No Image")
  const handleSelectCar = (carId: string) => {
    setSelectedCar(carId);
  };

  const selectedCarData = cars.find(car => car.id === selectedCar);


  //const handleBookNow() 
    //console.log(`Booking car with ID: ${selectedCar}`);
    //console.log(selectedCarData)
    //router.push({
      //pathname: `/book/[id]`,
      //params: { id: selectedCar } 
  //})
  

  //const selectedCarData = cars.find(car => car.id === selectedCar);

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.fixedHeader}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Cars Near You</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => {
                  console.log('View all pressed');
                  router.replace('/search');  
                }}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
          
            </View>
          </View>
          
          <View style={styles.carsList}>
            {cars.map((car) => (
              <TouchableOpacity
                key={car.id}
                style={[
                  styles.carCard,
                  selectedCar === car.id && styles.selectedCar
                ]}
                onPress={() => handleSelectCar(car.id)}
              >
                <Image 
    source={car.image ? { uri: car.image } : require('@/assets/images/car.jpg')}
    style={styles.carImage}
/>
                <View style={styles.carDetails}>
                  <Text style={styles.carName} numberOfLines={1}>{car.name}</Text>
                  <Text style={styles.carType} numberOfLines={1}>
                    {car.fuelType ? `${car.type} • ${car.fuelType}` : car.type}
                  </Text>
                  <Text style={styles.carDistance} numberOfLines={1}>{car.distance} away</Text>
                  {car.features && car.features.length > 0 && (
                    <Text style={styles.features} numberOfLines={1}>
                      {car.features.slice(0, 2).join(' • ')}
                      {car.features.length > 2 ? ' • ...' : ''}
                    </Text>
                  )}
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.carPrice}>{car.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheet>

      <View style={[
        styles.persistentBottomContainer,
        { paddingBottom: insets.bottom || 16 }
      ]}>
        <View style={styles.selectedCarInfo}>
          <View style={styles.selectedCarDetails}>
            <Text style={styles.selectedCarName} numberOfLines={1}>{selectedCarData?.name}</Text>
            <Text style={styles.selectedCarLocation} numberOfLines={1}>{selectedCarData?.location}</Text>
          </View>
          <Text style={styles.selectedCarPrice}>{selectedCarData?.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            console.log(`Booking car with ID: ${selectedCar}`);
            router.push({
              pathname: `/book/[id]`,
              params: { id: selectedCar,
                carData : JSON.stringify(selectedCarData)
               } 
              })
          }}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  handleIndicator: {
    backgroundColor: '#CBD5E0',
    width: 40,
    height: 4,
  },
  fixedHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
  },
  viewAllText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#007AFF',
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24,
  },
  carsList: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  carCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 104,
  },
  selectedCar: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#F0F9FF',
  },
  carImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  carDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    height: 80,
  },
  carName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  carType: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  carDistance: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 2,
  },
  features: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  priceContainer: {
    justifyContent: 'center',
    paddingLeft: 12,
    width: 80,
  },
  carPrice: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: '#007AFF',
  },
  persistentBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  selectedCarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedCarDetails: {
    flex: 1,
    marginRight: 12,
  },
  selectedCarName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  selectedCarLocation: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  selectedCarPrice: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: '#007AFF',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    fontFamily: 'DMSans_700Bold',
    color: 'white',
    fontSize: 16,
  },
});

export default CarBottomSheet;