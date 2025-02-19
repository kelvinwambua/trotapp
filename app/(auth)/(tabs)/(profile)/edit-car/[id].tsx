import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EditCarScreen = () => {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const car = useQuery(api.post.getPostById, { postId: id });
  const updatePost = useMutation(api.post.updatePost);

  const [formData, setFormData] = useState({
    carMake: '',
    carModel: '',
    carYear: '',
    carLocation: '',
    rentRange: '',
    carDescription: '',
    features: [],
    status: 'active',
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (car) {
      setFormData({
        carMake: car.carMake || '',
        carModel: car.carModel || '',
        carYear: car.carYear || '',
        carLocation: car.carLocation || '',
        rentRange: car.rentRange || '',
        carDescription: car.carDescription || '',
        features: car.features || [],
        status: car.status || 'active',
      });
    }
  }, [car]);

  const handleUpdateCar = async () => {
    try {
      setIsLoading(true);
      await updatePost({
        postId: id,
        updates: formData
      });
      Alert.alert("Success", "Car updated successfully", [
        { text: "OK", onPress: () => router.push("/(auth)/(tabs)/profile/cars") }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update car");
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded || !car) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{marginTop: 12, fontFamily: 'DMSans_400Regular'}}>Loading car details...</Text>
      </View>
    );
  }

  return (
    <>
          <Stack.Screen  
       
       options={{ 
       title:"Edit Car",
         headerShown: true }} />

    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Car</Text>
        <View style={{width: 40}} />
      </View> */}

      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Make</Text>
          <TextInput
            style={styles.input}
            value={formData.carMake}
            onChangeText={(text) => setFormData({...formData, carMake: text})}
            placeholder="e.g. Toyota"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            value={formData.carModel}
            onChangeText={(text) => setFormData({...formData, carModel: text})}
            placeholder="e.g. Camry"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            value={formData.carYear}
            onChangeText={(text) => setFormData({...formData, carYear: text})}
            placeholder="e.g. 2022"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={formData.carLocation}
            onChangeText={(text) => setFormData({...formData, carLocation: text})}
            placeholder="e.g. San Francisco, CA"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Rent Price</Text>
          <TextInput
            style={styles.input}
            value={formData.rentRange}
            onChangeText={(text) => setFormData({...formData, rentRange: text})}
            placeholder="e.g. $50-$100"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.carDescription}
            onChangeText={(text) => setFormData({...formData, carDescription: text})}
            placeholder="Describe your car"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Listing Status</Text>
          <View style={styles.statusToggle}>
            <TouchableOpacity
              style={[
                styles.statusOption,
                formData.status === 'active' && styles.statusOptionActive
              ]}
              onPress={() => setFormData({...formData, status: 'active'})}
            >
              <Text style={[
                styles.statusOptionText,
                formData.status === 'active' && styles.statusOptionTextActive
              ]}>Active</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.statusOption,
                formData.status === 'inactive' && styles.statusOptionActive
              ]}
              onPress={() => setFormData({...formData, status: 'inactive'})}
            >
              <Text style={[
                styles.statusOptionText,
                formData.status === 'inactive' && styles.statusOptionTextActive
              ]}>Inactive</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleUpdateCar}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Update Car</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    color: '#1A1A1A',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  statusToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusOption: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: '#007AFF',
  },
  statusOptionText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#8E8E93',
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#FFFFFF',
  },
});

export default EditCarScreen;