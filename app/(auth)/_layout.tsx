import { Stack } from 'expo-router';
const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
  name="(modal)/create" 
  options={{ 
    presentation: 'modal',
    title: "List Your Car",
    headerTitleStyle: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 20,
    }
  }} 
/>

    </Stack>
    
  );
};
export default Layout;
