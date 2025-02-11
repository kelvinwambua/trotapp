import { StyleSheet,Text, View, TextInput, TouchableOpacity, ScrollView, Button, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useConvexFileUpload } from '../../../hooks/useConvexFileUpload';
import {RadioButton} from 'react-native-paper'

type LocationType = {
  latitude: number;
  longitude: number;
};

const Page = () => {
  const [selectedValue, setSelectedValue] = useState('option1');
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
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== 'granted') {
        console.log("Permission to access location was denied");
        return;
      }

      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        console.log("Permission to access media library was denied");
        return;
      }

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
          const uploadUrl = await generateUploadUrl();
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const storageId = await uploadFile(uploadUrl, blob);

          setFormData(prev => ({ ...prev, carImageUrl: storageId }));
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
    if (!convexUser?._id) {
      alert('Please sign in to create a post');
      return;
    }

    if (!formData.carReg || !formData.carMake || !formData.carModel ||
      !formData.carYear || !formData.rentRange || !formData.carLocation ||
      !formData.carDescription || !formData.carImageUrl) {
      alert('Please fill in all required fields and upload an image');
      return;
    }

    try {
      await createPost({
        posterId: convexUser._id,
        ...formData
      });

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Car Rental Post</Text>

        <View
        style={styles.UserImageContainer}
        
        >
           <Image source={{uri:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ4AAACUCAMAAABVwGAvAAAANlBMVEX+/v68vb+9vb3f4OG6urq4ubv7+/vz8/P39/fZ2dnDw8Pw8PDd3d3j4+PR0dHLy8vp6em0tLQvYaEnAAAECklEQVR4nO2cW5ezKgxABwxX5TL//89+am17Om0VAgTPWu7XmYe9xIQQYn9+Li4uLi6wSK1mtOzt8Y5Ug7dswwanzuSopgAA/K7HOUCYVG+rDWkYMM4edrPeDFhzhiconRDsI0K47oLSw2e5Fd/ZTtnnK/cJ2/UNnO325Dr7aXsgt/jpXnYyHD27hdArPsz+e7chTB+7UfAUPSbGHnYypLh1W173JRu/A66DXkLU3vUsvV1MfniMQyTXS0oqdwK1nUqL2g3yvWNKynkPJmI9n6dHXLqk7LYv0O68Kj1uVwTty5eekzc92tRicvVoYyN5v71DGxvZerSJOTdwGe22e+ldek9oQ+PkkWsy7YiPa0PurkF73Bhz9WgPkzrPjrqg0pmxQX3UTWtgPKBuZMScgxpj1CdJabNOauRtjJyCFOibVDp9dTl0aEH69BZQjw7fmPz0+vSXB5EWHcTHoAc8sc/Sx+5nTNPrdnXgEqKXuFZ5YTq2m346XqxNsL/AvcLijoO9Be65sjfG8DU9i9DlRuMVadhHQSFOcd+8CFoA/gKc5DL8ho6L4RPrY7eLyM9IHZ0x3nvjxjPOilxcXDxQ0blhB+din2kquaS6w3plxYaB1nFWC/BtNunj/ma9o6pKtbEcDgqpN9adhMAthl9Yd9gsu3Vo7pdPjUuYmN1UfkEw024vltFmdh3fAWglqPxuZZwIB9uihJYDz2vpfdObCdWjWH+v2fMRrPIDHA8H9TKpeoHqfqss7H8QFef6pvw8dwhU88u9mU9DsDo5empixyr1/VwjOVblFjX3eioHKI7f9BlHFKX5z1TOd38pC19dO9/9ofCeN3PQDEFJ9KrGbqxssu+4OVtMwVVq47BdAfzqZt95Y/TwB6SWKfmhh4/d3CFClB5+wsW3t5uLe7Re2akxUQ+woStbp+SbHrbsGxvvt5setizInLbA6mFDt3W1sulhi77dL+TqgdzW0j6kKgd5ZNNZkzQF4HZdRaWHyyyJowLl4IqC2LxSvoEc9yfTw+XlgUoPV89nThDi9XDbRvtT2qaH2zao9JCtSDI9XL186V165eBCI/MzSDTIvOeo9AaU3slLArKCClfvURXz2BYa0UkNe5DUFIsL+AZfpNAraH639xO+ZMRFNQ0PDqXT/rLZhR9b3rvyueGxXf/bVrkydTXnCB7Um2mRMfDbaG0ds2U0t+44hroN/1bSA+5rjyvp6AGqrLKwU5tJoOgDyxiM+6TGrGk456XHwVsh7kPeSUq3/5zfNwFhiO0nDbXzwS5DfGk5m6+D4DaYkW4IUo5xMsHOay12lnv94yw2RUK1p6PUanSDD/PD/HtHMz+uZUI9Ki1PMaM+u66/rrj8wOJJlC4uLi7+d/wDi2c2oMA/dZIAAAAASUVORK5CYII="}} style={styles.UserImage}/>
            
            
        </View>
        <TextInput
          style={styles.input}
          placeholder="Car Registration Number *"
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
          keyboardType="numeric"
          value={formData.carYear}
          onChangeText={(text) => setFormData({ ...formData, carYear: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Rate * (e.g. $50-100 per day)"
          value={formData.rentRange}
          onChangeText={(text) => setFormData({ ...formData, rentRange: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Location *"
          value={formData.carLocation}
          onChangeText={(text) => setFormData({ ...formData, carLocation: text })}
        />

        <View>
          <Text style={styles.text}>Choose Fuel Type:</Text>
          <View style={styles.fuelTypes}>
              <View style={styles.radioBtn}>
                <RadioButton
                value="option1"
                status={selectedValue==="option1"?
                  'checked':'unchecked'
                }
                onPress={()=> setSelectedValue('option1')}
                color='#007BFF'
                />
                <Text>Petrol</Text>
              </View>
              <View style={styles.radioBtn}>
                <RadioButton
                value="option1"
                status={selectedValue==="option2"?
                  'checked':'unchecked'
                }
                onPress={()=> setSelectedValue('option2')}
                color='#007BFF'
                />
                <Text>Diesel</Text>
              </View>
              <View style={styles.radioBtn}>
                <RadioButton
                value="option3"
                status={selectedValue==="option3"?
                  'checked':'unchecked'
                }
                onPress={()=> setSelectedValue('option3')}
                color='#007BFF'
                />
                <Text>Electric</Text>
              </View>
              <View style={styles.radioBtn}>
                <RadioButton
                value="option4"
                status={selectedValue==="option4"?
                  'checked':'unchecked'
                }
                onPress={()=> setSelectedValue('option4')}
                color='#007BFF'
                />
                <Text style={styles.text}>Hybrid</Text>
              </View>

              
          </View>
        </View>

        

        {/* <View style={styles.ColorPicker}>
            <TextInput placeholder="Please select a color" style={styles.input}></TextInput>
        </View> */}

        <View>
          <TextInput 
          multiline={true}
          numberOfLines={5}
          placeholder='Add additional information about the car such e.g common issues*' style={styles.input}></TextInput>
        </View>

        <View style={styles.imageUploadContainer}>
            <Text style={styles.label}>Upload Car Image:</Text>
            <TouchableOpacity 
              style={[styles.imageUploadButton, isUploading && styles.buttonDisabled]} 
              onPress={pickImage} 
              disabled={isUploading}
            >
              <Text style={styles.imageUploadButtonText}>
                {isUploading ? "Uploading..." : "Select Image"}
              </Text>
            </TouchableOpacity>
                  
            {isUploading && <ActivityIndicator size="large" color="#007BFF" style={styles.loadingIndicator} />}
                  
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
              )}
      
      </View >
        <TouchableOpacity 
          style={[styles.submitBtn, isUploading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={isUploading}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
    marginBottom:10,
    borderRadius:20
    },

  card: { backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, },
    

  title: { 
    
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center' },

  input: { 
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8, 
    padding: 12,
    marginBottom: 10, 
    fontSize: 16 
  },

  image: { 
    width: 180,
    height: 180, 
    borderRadius: 10, 
    marginTop: 10 
  },

  button: { backgroundColor: '#007AFF',
     padding: 15, 
     borderRadius: 8, 
     alignItems: 'center', 
     marginTop: 10 
  },

  buttonDisabled: {
    backgroundColor: '#cccccc' 
  },

  buttonText: {
     color: '#fff', 
     fontSize: 16, 
     fontWeight: 'bold' 
  },

  UserImageContainer:{
     width:"100%",
     alignItems:"center",
     paddingBottom:25
  },

  UserImage:{
    borderRadius:30,
    width:50,
    height:50,
    backgroundColor:"lightgray",
    borderWidth:2,
    borderStyle:'solid',
    borderColor:"black"
  },

  imageSection:{
    width:"100%",
    flexDirection:'row'
  },

  imageBtn:{
    width: "100%",
  },

  submitBtn:{
    width:"100%",
    borderRadius:40,
    height:'auto',
    backgroundColor:"black",
    alignItems:'center',
    padding:15,
    marginTop:15,
    marginBottom:15

  },

  fuelTypes:{
    flexDirection:'row'
  },
  radioBtn:{
    flexDirection:'row',
    alignItems:'center'
  },
  text:{
    marginLeft: 0,
    fontSize: 16,
    color: '#333',
  },
  imageUploadContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageUploadButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    width:"100%",
    borderRadius:40
  },
  imageUploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  loadingIndicator: {
    marginTop: 10,
  },
  imagePreview: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#ddd',
  },
});

export default Page;
