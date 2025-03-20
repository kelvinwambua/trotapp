import { useLocalSearchParams, router } from 'expo-router';
import { Stack } from 'expo-router';
import * as React from 'react'; // Fixed React import
import { useState, useEffect, useRef } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  Platform,
  Dimensions,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addDays, differenceInDays } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { PayWithFlutterwave } from 'flutterwave-react-native';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';

import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

const { width, height } = Dimensions.get('window');


interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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
    <>
          <Stack.Screen
        options={{
          headerShown: true,
          title: 'Find Your Perfect Car',
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
        }}
      />
    <View style={styles.carouselContainer}>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri: string, index: number) => (
          <Image
            key={index}
            source={{ uri }}
            style={styles.carouselImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      
      <View style={styles.indicatorContainer}>
        {images.map((_: string, index: number) => (
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
    </>
  );
};


interface PaymentData {
  status: string;
  transaction_id?: string;
  payment_type?: string;
}

interface FlutterwaveConfig {
  tx_ref: string;
  authorization: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    phonenumber: string;
    name: string;
  };
  payment_options: string;
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
}

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 3));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [additionalRequests, setAdditionalRequests] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const carDetails = useQuery(api.post.getPostById, {postId: id as Id<"posts">});
  const createBooking = useMutation(api.booking.createBooking);
 
  const rentalDays = differenceInDays(endDate, startDate) || 1;
  const totalAmount = carDetails ? carDetails.price * rentalDays : 0;

  const generateTransactionRef = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `car_rental_${result}`;
  };


  const onStartDateChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(false);
    setStartDate(currentDate);
  
    if (currentDate > endDate) {
      setEndDate(addDays(currentDate, 1));
    }
  };
  
  const onEndDateChange = (event: Event, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(false);
    setEndDate(currentDate);
  };
  
 
  const paymentConfig: FlutterwaveConfig = {
    tx_ref: generateTransactionRef(),
    authorization: 'FLWPUBK_TEST-2fea7362a78407ae0ed7d145e2e09b5c-X',
    amount: totalAmount,
    currency: 'KES',
    customer: {
      email: user?.primaryEmailAddress?.emailAddress || '',
      phonenumber: '254712345678',
      name: user?.fullName || '',
    },
    payment_options: 'card,mpesa,ussd',
    customizations: {
      title: `${carDetails?.carMake} ${carDetails?.carModel} Booking`,
      description: `Rental payment for ${rentalDays} days`,
      logo: user?.imageUrl||'', 
    },
  };

  const handlePaymentSuccess = async (data: PaymentData) => {
    try {
      setIsLoading(true);
      
      if (!data.transaction_id) {
        throw new Error('No transaction ID received');
      }

      const booking = await createBooking({
        postId: id as Id<"posts">,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        totalAmount,
        additionalRequests,
        paymentMethod: data.payment_type || 'flutterwave',
        transactionId: data.transaction_id,
      });
      
      if (!booking) {
        throw new Error('Failed to create booking');
      }

      Alert.alert(
        'Booking Successful',
        'Your car rental has been booked successfully!',
        [{ 
          text: 'OK', 
          onPress: () => {
            setIsLoading(false);
            router.push('/(auth)/(tabs)/bookings');
          }
        }]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Error',
        'There was an error processing your booking. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Booking error:', error);
    }
  };
  const handlePaymentError = (error: unknown) => {
    Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    console.error('Payment error:', error);
  };
  
  const handlePaymentClose = () => {
    Alert.alert('Payment Cancelled', 'You cancelled the payment process.');
  };

  if (!fontsLoaded || !carDetails) {
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
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <Text style={styles.headerTitle}>
              Book {carDetails.carMake} {carDetails.carModel}
            </Text>
          ),
          headerShadowVisible: false,
        }}
      />
    <View style={styles.container}>
        

        <ScrollView showsVerticalScrollIndicator={false}>
   
          <View style={styles.imageCarouselWrapper}>
            <ImageCarousel images={carDetails.carImageUrls || [carDetails.carImageUrl?.[0]]} />
          </View>

        
          <View style={styles.detailsContainer}>
            <View style={styles.titleSection}>
              <View>
                <Text style={styles.carTitle}>
                  {carDetails.carMake} {carDetails.carModel} {carDetails.carYear}
                </Text>
                <Text style={styles.priceText}>{carDetails.price} KES/day</Text>
              </View>
              
              <View style={styles.statContainer}>
                <MaterialCommunityIcons name="eye-outline" size={20} color="#666" />
                <Text style={styles.statText}>{carDetails.views} views</Text>
              </View>
            </View>

            <View style={styles.quickInfoGrid}>
              {carDetails.carLocation && (
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#007AFF" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{carDetails.carLocation}</Text>
                  </View>
                </View>
              )}
              
              {carDetails.transmission && (
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="car-shift-pattern" size={24} color="#34C759" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Transmission</Text>
                    <Text style={styles.infoValue}>{carDetails.transmission}</Text>
                  </View>
                </View>
              )}
              
              {carDetails.fuelType && (
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="gas-station" size={24} color="#FF9500" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Fuel Type</Text>
                    <Text style={styles.infoValue}>{carDetails.fuelType}</Text>
                  </View>
                </View>
              )}
              
              {carDetails.mileage && (
                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="speedometer" size={24} color="#FF3B30" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Mileage</Text>
                    <Text style={styles.infoValue}>{carDetails.mileage.toLocaleString()} mi</Text>
                  </View>
                </View>
              )}
            </View>


            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Rental Dates</Text>
              <View style={styles.datesContainer}>
                <TouchableOpacity 
                  style={styles.dateCard} 
                  onPress={() => setShowStartPicker(true)}
                >
                  <MaterialCommunityIcons name="calendar" size={24} color="#007AFF" />
                  <View style={styles.dateTextContainer}>
                    <Text style={styles.dateLabel}>Pick-up Date</Text>
                    <Text style={styles.dateValue}>{format(startDate, 'EEE, MMM d, yyyy')}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
                
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={onStartDateChange}
                  />
                )}
                
                <TouchableOpacity 
                  style={styles.dateCard} 
                  onPress={() => setShowEndPicker(true)}
                >
                  <MaterialCommunityIcons name="calendar-clock" size={24} color="#007AFF" />
                  <View style={styles.dateTextContainer}>
                    <Text style={styles.dateLabel}>Return Date</Text>
                    <Text style={styles.dateValue}>{format(endDate, 'EEE, MMM d, yyyy')}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
                
                {showEndPicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    minimumDate={addDays(startDate, 1)}
                    onChange={onEndDateChange}
                  />
                )}
              </View>
            </View>

  
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rental Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration</Text>
                  <Text style={styles.summaryValue}>{rentalDays} day{rentalDays > 1 ? 's' : ''}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Daily Rate</Text>
                  <Text style={styles.summaryValue}>KES {carDetails.price}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>KES {totalAmount}</Text>
                </View>
              </View>
            </View>


            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Requests</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Any special requests or notes for the car owner?"
                value={additionalRequests}
                onChangeText={setAdditionalRequests}
              />
            </View>

            <View style={{ height: 80 }} />
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 20 }]}>
          <PayWithFlutterwave
            onRedirect={(data: PaymentData) => {
              if (data.status === 'successful') {
                handlePaymentSuccess(data);
              } else if (data.status === 'cancelled') {
                handlePaymentClose();
              } else {
                handlePaymentError(data);
              }
            }}
            options={paymentConfig}
            customButton={(props: any) => (
              <TouchableOpacity 
                style={[styles.payButton, (props.disabled || props.isInitializing || isLoading) && styles.disabledButton]}
                onPress={props.onPress}
                disabled={props.disabled || props.isInitializing || isLoading}
              >
                {isLoading || props.isInitializing ? (
                  <View style={styles.loadingButtonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.payButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <MaterialCommunityIcons name="credit-card-outline" size={20} color="#FFF" />
                    <Text style={styles.payButtonText}>Pay KES {totalAmount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </>
  );
}


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
  datesContainer: {
    gap: 12,
  },
  dateCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#007AFF',
  },
  textArea: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  payButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
  },
});