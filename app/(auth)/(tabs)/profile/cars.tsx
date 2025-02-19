import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const CarsScreen = () => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const userCars = useQuery(api.post.getUserCars, { 
    userId: user?.id 
  });

  if (!fontsLoaded || !userCars) {
    return <View style={styles.container}>
      <Text>Loading...</Text>
    </View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cars</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push("/add-car")}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.carsContainer}>
        {userCars.map((car) => (
          <TouchableOpacity 
            key={car._id} 
            style={styles.carCard}
            onPress={() => router.push(`/car-details/${car._id}`)}
          >
            <Image
              source={{ uri: car.carImageUrls?.[0] }}
              style={styles.carImage}
            />
            <View style={styles.carInfo}>
              <View style={styles.carHeader}>
                <Text style={styles.carName}>{car.carMake} {car.carModel} {car.carYear}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
              
              <View style={styles.carDetails}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                  <Text style={styles.detailText}>{car.carLocation}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="currency-usd" size={16} color="#666" />
                  <Text style={styles.detailText}>{car.rentRange} per day</Text>
                </View>
              </View>

              <View style={styles.carFeatures}>
                {car.features?.slice(0, 3).map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  addButton: {
    padding: 8,
  },
  carsContainer: {
    padding: 20,
    gap: 16,
  },
  carCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  carImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  carInfo: {
    padding: 16,
    gap: 12,
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carName: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: '#FFF',
  },
  carDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  carFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
});

export default CarsScreen;