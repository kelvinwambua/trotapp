import React from 'react';
import { View, Text, StyleSheet, TextInput, } from 'react-native';

export default function CreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a vehicle</Text>
      {/* Add creation functionality here */}

      <TextInput
        placeholder="Car Registration"></TextInput>




      
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
