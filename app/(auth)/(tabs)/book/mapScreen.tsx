import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useNavigation } from 'expo-router';
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";
import * as Location from 'expo-location';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const MAPBOX_ACCESS_TOKEN = "sk.eyJ1Ijoia2Vsdmlud2FtYnVhc3llbmdvIiwiYSI6ImNtMzVyZW1pNjA3MXAyaXF5eDA4NnFnZTkifQ.M9kqRHZYlL4HMo_bWPbZNA";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface LocationType {
  latitude: number;
  longitude: number;
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
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (posts) {
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

  const handleSearch = async () => {
    const coordinates = await geocodeLocation(searchQuery);
    if (coordinates) {
      setUserLocation(coordinates);
    } else {
      Alert.alert('Error', 'Location not found');
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.page}>
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Ionicons name="search" size={20} color="#000" />
            </TouchableOpacity>
          </View>

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
               
              </>
            )}
          </MapView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchButton: {
    marginLeft: 10,
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