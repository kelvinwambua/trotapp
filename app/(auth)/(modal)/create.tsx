import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Button, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useConvexFileUpload } from '../../../hooks/useConvexFileUpload';

type LocationType = {
  latitude: number;
  longitude: number;
};

const Page = () => {
  const { generateUploadUrl, uploadFile } = useConvexFileUpload();
  const createPost = useMutation(api.post.createPost);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const convexUser = useQuery(api.users.current);
  const [image, setImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    carReg: '',
    carMake: '',
    carModel: '',
    carYear: '',
    rentRange: '',
    carLocation: '',
    carDescription: '',
    carImageUrl: '',
    postDate: new Date().toISOString(),
  });

  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        console.log("Permission to access location was denied");
        return;
      }

      // Request media library permissions
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        console.log("Permission to access media library was denied");
        return;
      }

      // Get current location
      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setIsUploading(true);
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        
        try {
          // Get the upload URL from Convex
          const uploadUrl = await generateUploadUrl();
          
          // Convert the image to a blob
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          // Upload the file
          const storageId = await uploadFile(uploadUrl, blob);
          
          // Update form data with the storage ID
          setFormData(prev => ({
            ...prev,
            carImageUrl: storageId
          }));
          
          console.log('Image uploaded successfully');
        } catch (error) {
          console.error('Error during upload:', error);
          alert('Failed to upload image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to select image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!convexUser?._id) {
        alert('Please sign in to create a post');
        return;
      }

      // Validate required fields
      if (!formData.carReg || !formData.carMake || !formData.carModel || 
          !formData.carYear || !formData.rentRange || !formData.carLocation || 
          !formData.carDescription || !formData.carImageUrl) {
        alert('Please fill in all required fields and upload an image');
        return;
      }

      // Create post with all data including image URL
      await createPost({
        posterId: convexUser._id,
        ...formData
      });

      // Reset form after successful submission
      setFormData({
        carReg: '',
        carMake: '',
        carModel: '',
        carYear: '',
        rentRange: '',
        carLocation: '',
        carDescription: '',
        carImageUrl: '',
        postDate: new Date().toISOString(),
      });
      setImage(null);

      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  if (!convexUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
    
      <Text style={styles.title}>Create Post</Text>
      <Text>{userLocation?.latitude?.toString()||""}</Text>
      <Text>{userLocation?.longitude?.toString()||""}</Text>

      <View style={styles.form}>

        <TextInput
          style={styles.input}
          placeholder="Car Registration *"
          value={formData.carReg}
          onChangeText={(text) => setFormData({ ...formData, carReg: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Car Make *"
          value={formData.carMake}
          onChangeText={(text) => setFormData({ ...formData, carMake: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Car Model *"
          value={formData.carModel}
          onChangeText={(text) => setFormData({ ...formData, carModel: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Car Year *"
          value={formData.carYear}
          keyboardType="numeric"
          onChangeText={(text) => setFormData({ ...formData, carYear: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Rent Range * (e.g. $50-100 per day)"
          value={formData.rentRange}
          onChangeText={(text) => setFormData({ ...formData, rentRange: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Location *"
          value={formData.carLocation}
          onChangeText={(text) => setFormData({ ...formData, carLocation: text })}
        />

        <View style={styles.imageSection}>
          <Button 
            title={isUploading ? "Uploading..." : "Pick an image from camera roll"} 
            onPress={pickImage}
            disabled={isUploading}
          />
          {isUploading && <ActivityIndicator style={styles.loader} />}
          {image && <Image source={{ uri: image }} style={styles.image} />}
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description *"
          value={formData.carDescription}
          onChangeText={(text) => setFormData({ ...formData, carDescription: text })}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity 
          style={[
            styles.button,
            (!convexUser || isUploading) && styles.buttonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={!convexUser || isUploading}
        >
          <Text style={styles.buttonText}>
            {!convexUser 
              ? 'Sign in to Create Post'
              : isUploading 
                ? 'Uploading...'
                : 'Create Post'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageSection: {
    alignItems: 'center',
    gap: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  loader: {
    marginTop: 10,
  }
});

export default Page;