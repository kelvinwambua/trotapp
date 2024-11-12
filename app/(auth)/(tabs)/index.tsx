import { StyleSheet, View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";
import * as Location from 'expo-location';
import Animated, { useSharedValue, useAnimatedScrollHandler, runOnJS } from 'react-native-reanimated';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

Mapbox.setAccessToken("sk.eyJ1Ijoia2Vsdmlud2FtYnVhc3llbmdvIiwiYSI6ImNtMzVyZW1pNjA3MXAyaXF5eDA4NnFnZTkifQ.M9kqRHZYlL4HMo_bWPbZNA");


type LocationType = {
  latitude: number;
  longitude: number;
};

const Page = () => {
  const users = useQuery(api.users.getAllUsers);
  const navigation = useNavigation();

  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const scrollOffset = useSharedValue(0);
  const tabBarHeight = useBottomTabBarHeight();

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

  const updateTabbar = () => {
    let newMarginBottom = 0;
    if (scrollOffset.value >= 0 && scrollOffset.value <= tabBarHeight) {
      newMarginBottom = -scrollOffset.value;
    } else if (scrollOffset.value > tabBarHeight) {
      newMarginBottom = -tabBarHeight;
    }
    navigation.setOptions({ tabBarStyle: { marginBottom: newMarginBottom } });
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
      runOnJS(updateTabbar)();
    },
  });

  return (
    <View style={styles.page}>
      <MapView 
        style={styles.map} 
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
              <View style={styles.pin}>
                <View style={styles.pinCore} />
              </View>
            </PointAnnotation>
          </>
        )}
      </MapView>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  pin: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 122, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCore: {
    height: 15,
    width: 15,
    borderRadius: 7.5,
    backgroundColor: 'white',
  },
});
