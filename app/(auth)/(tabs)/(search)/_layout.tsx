import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack>
       <Stack.Screen 
        name="search" 
        options={{ title: 'Search Page', headerShown: false }} 
      />
      <Stack.Screen 
        name="reviews" 
        options={{ title: 'Reviews',headerTitleAlign:'center', headerShown: true }} 
      />
      <Stack.Screen 
        name="addReview" 
        options={{ title: 'Write a review', headerShown: true, headerTitleAlign:'center' }} 
      />
      
    </Stack>
  );
}