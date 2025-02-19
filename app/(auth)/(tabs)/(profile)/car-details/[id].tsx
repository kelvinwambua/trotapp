import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Platform, StatusBar } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');


interface CarDetails {
  _id: string;
  carMake: string;
  carModel: string;
  carYear: string;
  carLocation?: string;
  rentRange?: string;
  carDescription?: string;
  carImageUrls: string[];
  features: string[];
  status: 'active' | 'inactive' | 'pending';
  views: number;
  transmission?: string;
  fuelType?: string;
  mileage?: number;
  createdAt: string;
  updatedAt: string;
}

interface FeatureItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
}


const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons name={icon} size={20} color="#34C759" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);


const ImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  const scrollToImage = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  };

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={styles.carouselImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      
      {/* Indicators */}
      <View style={styles.indicatorContainer}>
        {images.map((_, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.indicator, 
              currentIndex === index && styles.activeIndicator
            ]}
            onPress={() => scrollToImage(index)}
          />
        ))}
      </View>
    </View>
  );
};

const CarDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  
  const car = useQuery(api.post.getPostById, { postId: id }) as CarDetails | undefined;
  const incrementViews = useMutation(api.post.incrementViews);
  
  useEffect(() => {
    if (id) {
      incrementViews({ postId: id });
    }
  }, [id]);

  const handleEdit = useCallback(() => {
    router.push({
      pathname: "/(auth)/(tabs)/(profile)/edit-car/[id]",
      params: { id }
    });
  }, [id]);

  if (!fontsLoaded || !car) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading car details...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }} />

      <View style={styles.container}>

        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{car.carMake} {car.carModel}</Text>
          <TouchableOpacity onPress={handleEdit}>
            <MaterialCommunityIcons name="pencil" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image Carousel */}
          <View style={styles.imageCarouselWrapper}>
            <ImageCarousel images={car.carImageUrls} />
            

            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(car.status) }]}>
              <Text style={styles.statusText}>
                {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Car Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.titleSection}>
              <View>
                <Text style={styles.carTitle}>
                  {car.carMake} {car.carModel} {car.carYear}
                </Text>
                <Text style={styles.priceText}>{car.rentRange}</Text>
              </View>
              <View style={styles.statContainer}>
                <MaterialCommunityIcons name="eye-outline" size={20} color="#666" />
                <Text style={styles.statText}>{car.views} views</Text>
              </View>
            </View>


            <View style={styles.quickInfoGrid}>
              {car.carLocation && (
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#007AFF" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{car.carLocation}</Text>
                  </View>
                </View>
              )}
              
              {car.transmission && (
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="car-shift-pattern" size={24} color="#34C759" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Transmission</Text>
                    <Text style={styles.infoValue}>{car.transmission}</Text>
                  </View>
                </View>
              )}
              
              {car.fuelType && (
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="gas-station" size={24} color="#FF9500" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Fuel Type</Text>
                    <Text style={styles.infoValue}>{car.fuelType}</Text>
                  </View>
                </View>
              )}
              
              {car.mileage && (
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="speedometer" size={24} color="#FF3B30" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Mileage</Text>
                    <Text style={styles.infoValue}>{car.mileage.toLocaleString()} mi</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>
                {car.carDescription || 'No description available'}
              </Text>
            </View>

            {/* Features */}
            {car.features.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Features</Text>
                <View style={styles.featuresGrid}>
                  {car.features.map((feature, index) => (
                    <FeatureItem
                      key={index}
                      icon="check-circle"
                      text={feature}
                    />
                  ))}
                </View>
              </View>
            )}
            

            <View style={{ height: 80 }} />
          </View>
        </ScrollView>


        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
            <Text style={styles.editButtonText}>Edit Listing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const getStatusColor = (status: CarDetails['status']): string => {
  const colors = {
    active: '#34C759',
    inactive: '#FF9500',
    pending: '#007AFF'
  };
  return colors[status];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  imageCarouselWrapper: {
    position: 'relative',
  },
  carouselContainer: {
    height: height * 0.3,
    position: 'relative',
  },
  carouselImage: {
    width,
    height: height * 0.3,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  detailsContainer: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  carTitle: {
    fontSize: 24,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#007AFF',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: '#666',
  },
  quickInfoGrid: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#4A4A4A',
    lineHeight: 24,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: '#1A1A1A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
  },
});

export default CarDetailsScreen;