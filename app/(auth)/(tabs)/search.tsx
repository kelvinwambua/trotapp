import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Image } from 'react-native';

//@/assets/images/car.jpg
export default function SearchScreen() {
  const posts = useQuery(api.post.getAllPosts); 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search bar</Text>
      {posts?.map((post)=>
    
                <View style={styles.container}>
                <Image style={styles.carImage} source={post.carImageUrls ? { uri: post.carImageUrl } : require('@/assets/images/car.jpg')}/>
                      <Text>{post.carDescription}</Text>
                      <Text></Text>
                      <Text>{post.carMake}|{post.carModel}|{post.carYear}|{post.carReg}</Text> 
                </View >
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  carImage: {
    width: 300,
    height: 200,
    borderRadius: 8,
  },

});
