import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser }  from '@clerk/clerk-expo';




export default function ProfileScreen() {
  const { isLoaded, isSignedIn, user } = useUser()
  if (!isLoaded || !isSignedIn) {
    return null
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Profile
        Hello, {user.firstName} {user.lastName}
        
        </Text>
      {/* Add profile information and settings here */}
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
