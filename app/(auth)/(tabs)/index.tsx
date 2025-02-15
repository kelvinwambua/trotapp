import { StyleSheet, View, Image, Text } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";
import * as Location from 'expo-location';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CarBottomSheet from './components/CarSuggestion';

const MAPBOX_ACCESS_TOKEN = "sk.eyJ1Ijoia2Vsdmlud2FtYnVhc3llbmdvIiwiYSI6ImNtMzVyZW1pNjA3MXAyaXF5eDA4NnFnZTkifQ.M9kqRHZYlL4HMo_bWPbZNA";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface LocationType {
  latitude: number;
  longitude: number;
}

interface Post {
  _id: string;
  carMake: string;
  carModel: string;
  carYear: string;
  rentRange: string;
  carLocation: string;
  carDescription: string;
  carImageUrl: string[];
  carImageUrls?: string[];
  features?: string[];
  fuelType?: string;
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
  carImageUrls?: string[];
}

interface CarMarkerProps {
  car: ProcessedCar;
}

const geocodeLocation = async (locationString: string): Promise<LocationType | null> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationString)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=KE`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const CarMarker = ({ car }: CarMarkerProps) => (
  <View style={styles.carMarker}>
    <View style={styles.carIconContainer}>
      <MaterialCommunityIcons 
        name="car" 
        size={24} 
        color="#FFFFFF" 
      />
    </View>
  </View>
);

const NAIROBI_COORDS = {
  latitude: -1.2921,
  longitude: 36.8219
};

const addJitter = (coordinate: number, amount: number = 0.0005) => {
  return coordinate + (Math.random() - 0.5) * amount;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const Page = () => {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  
  const posts = useQuery(api.post.getAllPosts); 
  console.log("Post data:", posts);
  const navigation = useNavigation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [processedCars, setProcessedCars] = useState<ProcessedCar[]>([]);

  useEffect(() => {
    if (posts) {
      console.log(`Total posts received: ${posts.length}`);
      posts.forEach((post: any, index: number) => {
        if (!post.carLocation) {
          console.warn(`Post ${index} is missing carLocation:`, post._id);
        }
      });
    }
  }, [posts]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("Permission to access location was denied");
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (posts && userLocation) {
        const processCars = async () => {
            const carsWithDistance = await Promise.all(posts.map(async (post: any, index: number) => {
                console.log(`Processing post ${index + 1}/${posts.length}:`, post._id);
                console.log("Post carImageUrls:", post.carImageUrls);

                // Geocode the location string
                const carCoordinates = await geocodeLocation(post.carLocation);
                if (!carCoordinates) {
                    console.warn(`Failed to geocode location for car ${post._id}: ${post.carLocation}`);
                }
                
                //Jitter to coordinates to avoid overlapping markers
                const carLocation = carCoordinates 
                    ? {
                        latitude: addJitter(carCoordinates.latitude),
                        longitude: addJitter(carCoordinates.longitude)
                      } 
                    : NAIROBI_COORDS;
                
                console.log(`Car ${post._id} coordinates:`, carLocation);
                
                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    carLocation.latitude,
                    carLocation.longitude
                );

                const processedCar = {
                    id: post._id,
                    name: `${post.carMake} ${post.carModel} ${post.carYear}`,
                    price: `KES ${post.rentRange}/day`,
                    image: post.carImageUrls?.[0],
                    type: post.carMake,
                    distance: `${distance.toFixed(1)} km`,
                    features: post.features || [],
                    fuelType: post.fuelType,
                    location: post.carLocation,
                    description: post.carDescription,
                    coordinates: carLocation,
                    carImageUrls: post.carImageUrls || []
                };

                console.log("Processed car with coordinates:", processedCar);
                return processedCar;
            }));
            
            console.log(`Successfully processed ${carsWithDistance.length} cars`);
            setProcessedCars(carsWithDistance);
        };

        processCars();
    }
}, [posts, userLocation]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.page}>
        <View style={styles.container}>
          <MapView 
            style={styles.map} 
            scaleBarEnabled={false}
            logoEnabled={false}
            compassEnabled={true}
            styleURL="mapbox://styles/mapbox/navigation-night-v1"
          >
            {userLocation && (
              <>
                <Camera
                  zoomLevel={14}  
                  centerCoordinate={[userLocation.longitude, userLocation.latitude]}
                  animationMode="flyTo"
                  animationDuration={2000}
                />
                <PointAnnotation
                  id="userLocationPin"
                  coordinate={[userLocation.longitude, userLocation.latitude]}
                >
                  <View style={styles.userPin}>
                    <View style={styles.userPinCore} />
                  </View>
                </PointAnnotation>
                
                {processedCars.map((car, index) => {
                  console.log(`Rendering car marker ${index + 1}/${processedCars.length}:`, car.id);
                  return (
                    <PointAnnotation
                      key={`car-${car.id}`}
                      id={`car-${car.id}`}
                      coordinate={[car.coordinates.longitude, car.coordinates.latitude]}
                    >
                      <CarMarker car={car} />
                    </PointAnnotation>
                  );
                })}
              </>
            )}
          </MapView>
          
          {userLocation && processedCars.length > 0 && (
            <CarBottomSheet 
              location={userLocation} 
              cars={processedCars} 
              bottomSheetRef={bottomSheetRef}
            />
          )}
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  userPin: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 122, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPinCore: {
    height: 15,
    width: 15,
    borderRadius: 7.5,
    backgroundColor: 'white',
  },
  carMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  carIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});

export default Page;