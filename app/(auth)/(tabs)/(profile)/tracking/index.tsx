import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Stack, useNavigation } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";
import * as Location from 'expo-location';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const MAPBOX_ACCESS_TOKEN = "sk.eyJ1Ijoia2Vsdmlud2FtYnVhc3llbmdvIiwiYSI6ImNtMzVyZW1pNjA3MXAyaXF5eDA4NnFnZTkifQ.M9kqRHZYlL4HMo_bWPbZNA";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

interface LocationType {
  latitude: number;
  longitude: number;
}

interface TrackedVehicle {
  id: string;
  tracking: {
    _id: string;
    currentLocation: LocationType;
    status: string;
    alerts: Array<{
      type: string;
      timestamp: string;
      details: string;
      resolved: boolean;
    }>;
    boundaries?: {
      maxLatitude: number;
      minLatitude: number;
      maxLongitude: number;
      minLongitude: number;
    };
  };
  car: {
    id: string;
    make: string;
    model: string;
    year: string;
    image: string | null;
    registration: string;
  };
  booking: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  coordinates: LocationType;
  userRole: "owner" | "renter";
}

interface VehicleMarkerProps {
  vehicle: TrackedVehicle;
  onPress: () => void;
}

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

const VehicleMarker = ({ vehicle, onPress }: VehicleMarkerProps) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.vehicleMarker}>
      <View style={[
        styles.vehicleIconContainer,
        { backgroundColor: vehicle.userRole === "owner" ? 'rgba(255, 59, 48, 0.9)' : 'rgba(52, 199, 89, 0.9)' }
      ]}>
        <MaterialCommunityIcons 
          name="car" 
          size={24} 
          color="#FFFFFF" 
        />
      </View>
    </View>
  </TouchableOpacity>
);

const VehicleDetailsSheet = ({ vehicle, userDistance, bottomSheetRef }: any) => {
  const hasUnresolvedAlerts = vehicle?.tracking?.alerts?.some((alert: any) => !alert.resolved);
  
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['25%', '50%']}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <View style={styles.bottomSheetContent}>
        <Text style={styles.vehicleName}>{vehicle?.car?.make} {vehicle?.car?.model} {vehicle?.car?.year}</Text>
        <Text style={styles.vehicleRegistration}>Reg: {vehicle?.car?.registration}</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: vehicle?.tracking?.status === 'active' ? '#34C759' : '#FF9500' }
          ]}>
            <Text style={styles.statusText}>{vehicle?.tracking?.status}</Text>
          </View>
          
          {hasUnresolvedAlerts && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>⚠️ Alert</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.distanceText}>Distance: {userDistance} km</Text>
        <Text style={styles.roleText}>You are the: {vehicle?.userRole === 'owner' ? 'Owner' : 'Renter'}</Text>
      </View>
    </BottomSheet>
  );
};

const NAIROBI_COORDS = {
  latitude: -1.2921,
  longitude: 36.8219
};

const TrackingMapPage = () => {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  
  const navigation = useNavigation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<TrackedVehicle | null>(null);
  const [userDistance, setUserDistance] = useState<string>("0.0");
  
  // Use the tracking API instead of post API
  const trackedVehicles = useQuery(api.tracking.getActiveTrackedVehiclesForMap);
  
  console.log("Tracked vehicles data:", trackedVehicles);

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

  const handleVehiclePress = (vehicle: TrackedVehicle) => {
    setSelectedVehicle(vehicle);
    
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        vehicle.coordinates.latitude,
        vehicle.coordinates.longitude
      );
      setUserDistance(distance.toFixed(1));
    }
    
    bottomSheetRef.current?.expand();
  };


  const renderBoundaries = (vehicle: TrackedVehicle) => {
    if (!vehicle.tracking.boundaries) return null;
    
    const { maxLatitude, minLatitude, maxLongitude, minLongitude } = vehicle.tracking.boundaries;
    

    const coordinates = [
      [minLongitude, minLatitude],
      [maxLongitude, minLatitude],
      [maxLongitude, maxLatitude],
      [minLongitude, maxLatitude],
      [minLongitude, minLatitude]
    ];
    
    return (
      <Mapbox.ShapeSource id={`boundary-${vehicle.id}`} shape={{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        }
      }}>
        <Mapbox.LineLayer
          id={`boundary-line-${vehicle.id}`}
          style={{
            lineColor: vehicle.userRole === 'owner' ? '#FF3B30' : '#34C759',
            lineWidth: 2,
            lineDasharray: [2, 2]
          }}
        />
        <Mapbox.FillLayer
          id={`boundary-fill-${vehicle.id}`}
          style={{
            fillColor: vehicle.userRole === 'owner' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)'
          }}
        />
      </Mapbox.ShapeSource>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
         <Stack.Screen options={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }} />
    
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
                
                {trackedVehicles && trackedVehicles.map((vehicle) => {
                  console.log(`Rendering vehicle marker:`, vehicle.id);
                  
                  // Render boundaries if they exist
                  return (
                    <React.Fragment key={`vehicle-${vehicle.id}`}>
                      {renderBoundaries(vehicle)}
                      <PointAnnotation
                        id={`vehicle-${vehicle.id}`}
                        coordinate={[vehicle.coordinates.longitude, vehicle.coordinates.latitude]}
                      >
                        <VehicleMarker 
                          vehicle={vehicle} 
                          onPress={() => handleVehiclePress(vehicle)} 
                        />
                      </PointAnnotation>
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </MapView>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Vehicle Tracking</Text>
            <Text style={styles.headerSubtitle}>
              {trackedVehicles ? `${trackedVehicles.length} Active Vehicles` : 'Loading...'}
            </Text>
          </View>
          
          <VehicleDetailsSheet 
            vehicle={selectedVehicle} 
            userDistance={userDistance}
            bottomSheetRef={bottomSheetRef}
          />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
    </>
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
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    margin: 16,
  },
  headerTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
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
  vehicleMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  bottomSheetBackground: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetContent: {
    padding: 16,
  },
  vehicleName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vehicleRegistration: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  alertBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  alertText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  distanceText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: '#CCCCCC',
  }
});

export default TrackingMapPage;