import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';

const IdentityVerificationScreen = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const [idFrontImage, setIdFrontImage] = useState(null);
  const [idBackImage, setIdBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('not_verified'); // 'not_verified', 'pending', 'verified'

  if (!isLoaded || !isSignedIn || !fontsLoaded) {
    return <View style={styles.container}>
      <Text>Loading...</Text>
    </View>;
  }

  const pickImage = async (setImageFunction) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'You need to allow access to your photos to upload ID documents');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageFunction(result.assets[0].uri);
    }
  };

  const takeSelfie = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'You need to allow access to your camera to take a selfie');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelfieImage(result.assets[0].uri);
    }
  };

  const submitVerification = () => {
    if (!idFrontImage || !idBackImage || !selfieImage) {
      Alert.alert('Missing documents', 'Please upload all required documents to proceed');
      return;
    }

    // Here you would call your Convex function to submit the verification
    // For now, we'll just simulate the process
    setVerificationStatus('pending');
    
    // Simulate API call
    setTimeout(() => {
      setVerificationStatus('verified');
      Alert.alert(
        'Verification Successful', 
        'Your identity has been verified successfully!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    }, 2000);
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons name="check-circle" size={50} color="#34C759" />
            <Text style={styles.verifiedText}>Verified</Text>
            <Text style={styles.statusDescription}>Your identity has been verified successfully!</Text>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons name="clock-outline" size={50} color="#FF9500" />
            <Text style={styles.pendingText}>In Progress</Text>
            <Text style={styles.statusDescription}>We're reviewing your documents. This usually takes less than 24 hours.</Text>
          </View>
        );
      default:
        return (
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons name="shield-outline" size={50} color="#007AFF" />
            <Text style={styles.notVerifiedText}>Not Verified</Text>
            <Text style={styles.statusDescription}>Upload your documents to verify your identity.</Text>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <LinearGradient
        colors={['#007AFF', '#00A2FF']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Identity Verification</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </LinearGradient>


      {renderVerificationStatus()}


      {verificationStatus === 'not_verified' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Documents</Text>
          
          <View style={styles.documentContainer}>
            <Text style={styles.documentTitle}>ID Card - Front</Text>
            <TouchableOpacity 
              style={styles.documentUpload}
              onPress={() => pickImage(setIdFrontImage)}
            >
              {idFrontImage ? (
                <Image source={{ uri: idFrontImage }} style={styles.documentImage} />
              ) : (
                <>
                  <MaterialCommunityIcons name="card-account-details-outline" size={40} color="#007AFF" />
                  <Text style={styles.uploadText}>Tap to upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.documentContainer}>
            <Text style={styles.documentTitle}>ID Card - Back</Text>
            <TouchableOpacity 
              style={styles.documentUpload}
              onPress={() => pickImage(setIdBackImage)}
            >
              {idBackImage ? (
                <Image source={{ uri: idBackImage }} style={styles.documentImage} />
              ) : (
                <>
                  <MaterialCommunityIcons name="card-account-details-outline" size={40} color="#007AFF" />
                  <Text style={styles.uploadText}>Tap to upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.documentContainer}>
            <Text style={styles.documentTitle}>Selfie Photo</Text>
            <TouchableOpacity 
              style={styles.documentUpload}
              onPress={takeSelfie}
            >
              {selfieImage ? (
                <Image source={{ uri: selfieImage }} style={[styles.documentImage, {borderRadius: 75}]} />
              ) : (
                <>
                  <MaterialCommunityIcons name="camera" size={40} color="#007AFF" />
                  <Text style={styles.uploadText}>Tap to take a selfie</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={submitVerification}
          >
            <Text style={styles.submitButtonText}>Submit for Verification</Text>
          </TouchableOpacity>
        </View>
      )}

 
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verification Tips</Text>
        
        <View style={styles.tipContainer}>
          <MaterialCommunityIcons name="lightbulb-outline" size={24} color="#FFD700" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Good Lighting</Text>
            <Text style={styles.tipDescription}>Ensure your documents are well-lit and clearly visible.</Text>
          </View>
        </View>

        <View style={styles.tipContainer}>
          <MaterialCommunityIcons name="card-bulleted-outline" size={24} color="#FFD700" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Full Document</Text>
            <Text style={styles.tipDescription}>Make sure all corners of your ID are visible in the photo.</Text>
          </View>
        </View>

        <View style={styles.tipContainer}>
          <MaterialCommunityIcons name="face-recognition" size={24} color="#FFD700" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Clear Selfie</Text>
            <Text style={styles.tipDescription}>Take a selfie with neutral expression and good lighting.</Text>
          </View>
        </View>
      </View>


      <View style={styles.privacySection}>
        <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#8E8E93" />
        <Text style={styles.privacyText}>
          Your documents are encrypted and securely stored. We follow strict privacy guidelines and will only use your information for verification purposes.
        </Text>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: insets.bottom + 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
  },
  placeholderIcon: {
    width: 40,
  },
  statusContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  verifiedText: {
    fontSize: 22,
    fontFamily: 'DMSans_700Bold',
    color: '#34C759',
    marginTop: 12,
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 22,
    fontFamily: 'DMSans_700Bold',
    color: '#FF9500',
    marginTop: 12,
    marginBottom: 8,
  },
  notVerifiedText: {
    fontSize: 22,
    fontFamily: 'DMSans_700Bold',
    color: '#007AFF',
    marginTop: 12,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  documentContainer: {
    marginBottom: 20,
  },
  documentTitle: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  documentUpload: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
    marginTop: 8,
  },
  documentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  tipContent: {
    marginLeft: 16,
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  privacySection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  privacyText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#8E8E93',
  },
});

export default IdentityVerificationScreen;