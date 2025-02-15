import { StyleSheet, View } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";
import * as Location from 'expo-location';
import  { useSharedValue, useAnimatedScrollHandler, runOnJS } from 'react-native-reanimated';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import CarSuggestion from './CarSuggestion';

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
  // Sample car data with images
  const sampleCars = [
    {
      id: 1,
      name: "Toyota RAV4",
      price: "KES 3000/day",
      image: "https://www.topgear.com/sites/default/files/2024/09/Toyota-RAV4-Hybrid-036.jpg?w=892&h=502",
      type: "SUV",
      distance: "0.5 km",
    },
    {
      id: 2,
      name: "Mazda cx5",
      price: "KES 5000/day",
      image: "https://automotivedoctor.co.ke/wp-content/uploads/2024/08/cx-5-skyactiv-g-awd-gt-sport-auto-action-3.jpg",
      type: "SUV",
      distance: "1.2 km",
    },
    {
      id: 3,
      name: "Honda CR-V",
      price: "KES 2500/day",
      image: "https://www.carpro.com/hs-fs/hubfs/2023-Honda-CRV-Sport-Touring-Hybrid-CarPro.jpg?width=1020&name=2023-Honda-CRV-Sport-Touring-Hybrid-CarPro.jpg",
      type: "SUV",
      distance: "2.0 km",
    },
    {
      id: 4,
      name: "BMW X5",
      price: "KES 6000/day",
      image: "https://stimg.cardekho.com/images/carexteriorimages/630x420/BMW/X5-2023/10452/1688992642182/front-left-side-47.jpg?tr=w-664",
      type: "Luxury",
      distance: "3.1 km",
    },
  ];

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
              <View style={styles.pin}>
                <View style={styles.pinCore} />
              </View>
            </PointAnnotation>
          </>
        )}
      </MapView>
      {userLocation && <CarSuggestion location={userLocation} cars={sampleCars} />}

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
