import { NavigationContainerRefContext } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import React from 'react';

import { View, Text, StyleSheet } from 'react-native';


export default function BookingScreen(){
    
    const { id } = useLocalSearchParams();
    
    return(
     
            <View>
                <Text>Booking screen......{id}</Text>
            </View>
       
    )
}   
