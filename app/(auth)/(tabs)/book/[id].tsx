import { NavigationContainerRefContext } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import React, {useCallback, useRef, useState} from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { api } from '@/convex/_generated/api';

import { query } from '@/convex/_generated/server';
import { useQuery } from 'convex/react';
import { v } from 'convex/values';
import { Post } from '@/convex/schema';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';



export default function BookingScreen() {
  const { id } = useLocalSearchParams();
      
  //const carDetails = useQuery(api.post.getPostById, {postId: id as Id<"posts">});
  const posts = useQuery(api.post.getAllPosts);
  //console.log(carDetails)
 

  return (
      <View style={styles.screen}>
            <Image style={styles.carImage} source={require('@/assets/images/car.jpg')} /> 
            <View style={styles.container}>
                  <Text style={styles.title}>Honda CRV 2024</Text>
                  <View style={styles.flexbox}>
                  {/* Features*/}
                        <Text style={styles.mutedText}> Diesel |</Text>
                        <Text style={styles.mutedText}> Automatic |</Text>
                        <Text style={styles.mutedText}> Air Con</Text>
                  </View>
                  
                  <View style={styles.flexbox}>
                       
                       <View style={styles.flexboxes}>
                              <MaterialIcons name="speed" size={20} color="black" ></MaterialIcons>
                              <Text>100000km</Text>
                       </View>
                       <View style={styles.flexboxes}>
                              <Ionicons name="shield-checkmark-sharp" size={20} color="black" ></Ionicons>

                       </View>


                 
                 </View>
                 
            </View>
            <TouchableOpacity onPress={()=>console.log('Booking...')}>
                  <Text style={styles.button}>Book</Text>
            </TouchableOpacity>
           

            
            
   
      </View>
  );
}
const styles = StyleSheet.create({
      screen:{
            flex:1
      },
      container: {
            width: 400,
            marginLeft: 5,
            marginRight: 5,
            backgroundColor: 'white',
            padding: 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            shadowColor:'#000',
            shadowOffset:{width:0,height:4},
            shadowOpacity:0.2,
            shadowRadius:6,
            elevation:8,
            flex: 1
      },
      usertitle:{
            fontSize: 11,
            color: 'black',
            marginBottom: 2,
      },

      

      reviewsbox: {
            marginTop: 20,
            margin: 10,
            borderRadius: 20,
            color: '#8c8e9b'
      },
      descriptionbox: {
            marginTop: 10,
            fontSize: 10,

      },
      flexbox:{
            flexWrap: 'nowrap',
            flexDirection: 'row'

      },
      flexboxes:{
            backgroundColor: 'white',
            flexDirection:'row',
            height: 'auto',
            color: 'black',
            margin: 10,
            padding: 10,
            fontWeight: 'bold',
            borderRadius: 25,
            shadowColor:'#000',
            shadowOffset:{width:0,height:4},
            shadowOpacity:0.2,
            shadowRadius:6,
            elevation:3,


      },
      button:{
            backgroundColor: '#007AFF',
            marginTop: 20,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            padding: 18,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,         
      },
   
      title: {
            fontSize: 24,
            fontWeight: 'bold',
      },
      mutedText: {
            fontSize: 18,
            color: "#8c8e9b",
      },
      carImage:{
            height: 300,
            width: 400,
            marginLeft: 5,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
      }
    });
    