import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Animated,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useConvexFileUpload } from '../../../hooks/useConvexFileUpload';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

const STEPS = [
  { id: 0, title: 'Photos', icon: 'camera' },
  { id: 1, title: 'Details', icon: 'car' },
  { id: 2, title: 'Location & Price', icon: 'location' },
  { id: 3, title: 'Preview', icon: 'eye' },
];

const CAR_FEATURES = [
  'Air Conditioning',
  'Bluetooth',
  'Leather Seats',
  'Parking Sensors',
  'Backup Camera',
  'Navigation',
  'Sunroof',
  'Child Seats',
];

interface FormData {
  carReg: string;
  carMake: string;
  carModel: string;
  carYear: string;
  rentRange: string;
  carLocation: string;
  carDescription: string;
  postDate: string;
  features: string[];
  fuelType: string;
}

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

const CarFormStep: React.FC<{ step: number; children: React.ReactNode }> = ({ step, children }) => (
  <Animated.View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>
      <Ionicons name={STEPS[step].icon} size={24} color="#007AFF" /> {STEPS[step].title}
    </Text>
    {children}
  </Animated.View>
);

const ProgressBar: React.FC<{ step: number }> = ({ step }) => (
  <View style={styles.progressContainer}>
    {STEPS.map((stepItem, index) => (
      <View key={stepItem.title} style={styles.progressStep}>
        <LinearGradient
          colors={index <= step ? ['#007AFF', '#00C6FF'] : ['#E5E5E5', '#F5F5F5']}
          style={styles.progressDot}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons 
            name={stepItem.icon} 
            size={16} 
            color={index <= step ? '#FFF' : '#999'} 
          />
        </LinearGradient>
        <Text style={[
          styles.progressLabel,
          index <= step && styles.progressLabelActive,
        ]}>
          {stepItem.title}
        </Text>
      </View>
    ))}
  </View>
);

export default function ListingPage() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    carReg: '',
    carMake: '',
    carModel: '',
    carYear: '',
    rentRange: '',
    carLocation: '',
    carDescription: '',
    postDate: new Date().toISOString(),
    features: [],
    fuelType: 'petrol',
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageStorageIds, setImageStorageIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const uploadProgress = useRef(new Animated.Value(0)).current;

  const convexUser = useQuery(api.users.current);
  const createPost = useMutation(api.post.createPost);
  const { generateUploadUrl, uploadFile } = useConvexFileUpload();

  useEffect(() => {
    requestPermissions();
  }, []);
  useEffect(() => {
    (async () => {
      await requestPermissions();
      
      getCurrentLocation();
    })();
  }, []);

  const requestPermissions = async () => {
    const locationPermission = await Location.requestForegroundPermissionsAsync();
    const imagePermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (locationPermission.status !== 'granted' || imagePermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please enable location and image library permissions to use all features.'
      );
    }
  };

  const animateUpload = useCallback(() => {
    Animated.timing(uploadProgress, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [uploadProgress]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled) {
        setIsUploading(true);
        animateUpload();
        const newUris = result.assets.map((asset) => asset.uri);
        setImages([...images, ...newUris]);
        
        const uploads = result.assets.map(async (asset) => {
          const url = await generateUploadUrl();
          const blob = await (await fetch(asset.uri)).blob();
          return uploadFile(url, blob);
        });
        
        const stored = await Promise.all(uploads);
        setImageStorageIds([...imageStorageIds, ...stored]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    } finally {
      setIsUploading(false);
      uploadProgress.setValue(0);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please enable location services');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await reverseGeocode(location.coords);
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      });
      setFormData({ ...formData, carLocation: address || '' });
      setShowLocationModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const reverseGeocode = async (coords: { latitude: number; longitude: number }) => {
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (results?.[0]) {
        const { street, city, region } = results[0];
        return `${street}, ${city}, ${region}`;
      }
      return '';
    } catch (error) {
      return '';
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (images.length === 0) {
          Alert.alert('Error', 'Please add at least one image');
          return false;
        }
        break;
      case 1:
        if (!formData.carMake || !formData.carModel || !formData.carYear || !formData.carReg) {
          Alert.alert('Error', 'Please fill in all car details');
          return false;
        }
        break;
      case 2:
        if (!formData.carLocation || !formData.rentRange) {
          Alert.alert('Error', 'Please fill in location and price');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!convexUser?._id) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    try {
      await createPost({
        posterId: convexUser._id,
        ...formData,
        // fueltype: formData.fuelType,
        // carImageUrl: imageStorageIds[0],
        carImageUrl: imageStorageIds,
      });

      Alert.alert(
        'Success',
        'Your car has been listed!',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/(tabs)/') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create listing');
    }
  };

  const renderPhotoStep = () => (
    <View style={styles.imageSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imgHolder}>
            <Image source={{ uri }} style={styles.largeImage} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => {
                setImages(images.filter((_, i) => i !== index));
                setImageStorageIds(imageStorageIds.filter((_, i) => i !== index));
              }}
            >
              <Ionicons name="close-circle" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 5 && (
          <TouchableOpacity
            style={styles.addImgBtn}
            onPress={pickImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <>
                <Ionicons name="camera" size={32} color="#666" />
                <Text style={styles.addImgText}>Add Photos</Text>
                <Text style={styles.addImgSub}>{images.length}/5</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.formSection}>
      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Make</Text>
          <TextInput
            style={styles.input}
            placeholder="Toyota"
            value={formData.carMake}
            onChangeText={(text) => setFormData({ ...formData, carMake: text })}
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Camry"
            value={formData.carModel}
            onChangeText={(text) => setFormData({ ...formData, carModel: text })}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            placeholder="2023"
            keyboardType="numeric"
            value={formData.carYear}
            onChangeText={(text) => setFormData({ ...formData, carYear: text })}
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Registration</Text>
          <TextInput
            style={styles.input}
            placeholder="ABC123"
            value={formData.carReg}
            onChangeText={(text) => setFormData({ ...formData, carReg: text })}
          />
        </View>
      </View>

      <Text style={styles.label}>Features</Text>
      <View style={styles.featuresList}>
        {CAR_FEATURES.map((feature) => (
          <TouchableOpacity
            key={feature}
            style={[
              styles.featureTag,
              formData.features.includes(feature) && styles.featureTagActive,
            ]}
            onPress={() => {
              setFormData({
                ...formData,
                features: formData.features.includes(feature)
                  ? formData.features.filter(f => f !== feature)
                  : [...formData.features, feature],
              });
            }}
          >
            <Text style={[
              styles.featureTagText,
              formData.features.includes(feature) && styles.featureTagTextActive,
            ]}>
              {feature}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.formSection}>
      <Text style={styles.label}>Daily Rate (KES)</Text>
      <TextInput
        style={[styles.input, styles.rateInput]}
        placeholder="1000"
        keyboardType="numeric"
        value={formData.rentRange}
        onChangeText={(text) => setFormData({ ...formData, rentRange: text })}
      />
  
      <Text style={styles.label}>Location</Text>
      <View style={styles.locationContainer}>
        <TextInput
          style={[styles.input, styles.locationInput]}
          placeholder="Enter location"
          value={formData.carLocation}
          onChangeText={(text) => setFormData({ ...formData, carLocation: text })}
        />
        <TouchableOpacity
          style={styles.getCurrentLocationBtn}
          onPress={getCurrentLocation}
        >
          <Ionicons name="location" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
  
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.descInput}
        placeholder="Tell renters about your car..."
        multiline
        numberOfLines={4}
        value={formData.carDescription}
        onChangeText={(text) => setFormData({ ...formData, carDescription: text })}
      />
    </View>
  );

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <LinearGradient
        colors={['#FFF', '#F8F9FA']}
        style={styles.previewCard}
      >
        <Image
          source={{ uri: images[0] }}
          style={styles.previewImage}
        />
        <View style={styles.previewContent}>
          <Text style={styles.previewTitle}>
            {formData.carYear} {formData.carMake} {formData.carModel}
          </Text>
          <Text style={styles.previewPrice}>KES {formData.rentRange}/day</Text>
          <Text style={styles.previewLocation}>
            <Ionicons name="location" size={16} color="#666" />
            {' '}{formData.carLocation}
          </Text>
          <Text style={styles.previewDescription} numberOfLines={3}>
            {formData.carDescription}
          </Text>
          <View style={styles.previewFeatures}>
          {formData.features.map((feature) => (
              <View key={feature} style={styles.previewFeatureTag}>
                <Text style={styles.previewFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CarFormStep step={0}>{renderPhotoStep()}</CarFormStep>;
      case 1:
        return <CarFormStep step={1}>{renderDetailsStep()}</CarFormStep>;
      case 2:
        return <CarFormStep step={2}>{renderLocationStep()}</CarFormStep>;
      case 3:
        return <CarFormStep step={3}>{renderPreview()}</CarFormStep>;
      default:
        return null;
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ProgressBar step={currentStep} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      <BlurView intensity={95} style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            if (validateStep()) {
              if (currentStep === STEPS.length - 1) {
                handleSubmit();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }
          }}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === STEPS.length - 1 ? 'List Your Car' : 'Continue'}
          </Text>
          <Ionicons 
            name={currentStep === STEPS.length - 1 ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color="#FFF" 
          />
        </TouchableOpacity>
      </BlurView>

      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.modalButtonText}>Use Current Location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSecondaryButton]}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: '#999',
  },
  progressLabelActive: {
    color: '#007AFF',
    fontFamily: 'DMSans_700Bold',
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 24,
    color: '#1A1A1A',
  },
  imageSection: {
    marginHorizontal: -20,
    paddingLeft: 20,
  },
  imgHolder: {
    width: width * 0.8,
    height: 240,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  largeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  addImgBtn: {
    width: width * 0.8,
    height: 240,
    borderRadius: 16,
    borderColor: '#E9ECEF',
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginRight: 15,
  },
  addImgText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#666',
  },
  addImgSub: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#999',
    marginTop: 4,
  },
  formSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontFamily: 'DMSans_600Medium',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
  },
  inputFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#FFF',
  },
  rateInput: {
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  locInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
  },
  descInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 16,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    height: 120,
    textAlignVertical: 'top',
  },
  previewContainer: {
    padding: 20,
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  previewContent: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 24,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  previewPrice: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  previewLocation: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDescription: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
    lineHeight: 24,
  },
  previewFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  previewFeatureTag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginTop: 8,
  },
  previewFeatureText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 16,
    marginRight: 8,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'DMSans_600Medium',
    color: '#666',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginLeft: 8,
  },
  nextButtonText: {
    marginRight: 8,
    fontSize: 16,
    fontFamily: 'DMSans_600Medium',
    color: '#FFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'DMSans_600Medium',
  },
  modalSecondaryButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  modalSecondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'DMSans_600Medium',
  },
  featureTagActive: {
    backgroundColor: '#007AFF',
  },
  featureTagTextActive: {
    color: '#FFF',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  successText: {
    color: '#34C759',
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    margin: 4,
  },
  featureTagText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  getCurrentLocationBtn: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
});