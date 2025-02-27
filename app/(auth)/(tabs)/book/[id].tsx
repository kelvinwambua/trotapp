import { NavigationContainerRefContext } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import React, {useState} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BookingScreen(){
    
    const { id } = useLocalSearchParams();
    
    return(
     
            <View>
                <Text>Booking screen......{id}</Text>
            </View>
       
    )
}   
