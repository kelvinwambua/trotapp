import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useUser, useAuth }  from '@clerk/clerk-expo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';




export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser()
  
  if (!isLoaded || !isSignedIn) {
    return (
    <View style={styles.container}>
      <Text>Log in</Text>
      <Text>Sign up</Text>
    </View>)
  }
  return (
    <View style={styles.container}>
      <MaterialIcons name="account-circle" size={50} color="black" />
     
      <Text style={styles.title}>
        Hello, {user.firstName} {user.lastName} 
      </Text>
      <Button 
        title='Log out'
        onPress={() => signOut()}
        color="#ed1109"
      ></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#20232a',
    color: '#20232a',
  },
  title: {
    fontSize: 24,
    padding: 24,
  },
});
