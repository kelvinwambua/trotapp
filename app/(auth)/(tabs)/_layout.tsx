import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, TouchableOpacity, Text, View, Image } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useUser } from '@clerk/clerk-expo';

const CreateTabIcon = ({ color, size }: { color: string; size: number }) => (
  <View style={styles.createIconContainer}>
    <Ionicons name="add" size={size} color={color} />
  </View>
);
const colors = {
  primary: '#4dabfe',    

};

const Layout = () => {
  const { signOut } = useAuth();
  const {user} = useUser();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#000',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => signOut()}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <CreateTabIcon color={color} size={size} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/(modal)/create');
          },
        }}
      />
      {/* <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="(messages)"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size, focused }) => (
            // <Ionicons name={focused ? 'mail' : 'heart-outline'} size={size} color={color} />
            <MaterialIcons name={focused ? 'message' :'email'} size={size} color={color}></MaterialIcons>
          ),
        }}
      />
            <Tabs.Screen 
                name="(profile)"
                
                options={{
                    title: 'Profile',
                    headerShown: false,
                    
                    tabBarIcon: ({ focused }) => (
                        <View style={{        
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 12, 
                            backgroundColor: focused ? `${colors.primary}15` : 'transparent' 
                        }}>
                            <Image 
                                source={{ uri: user?.imageUrl||`https://robohash.org/${user?.firstName}` }} 
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    borderWidth: focused ? 2 : 0,
                                    borderColor: colors.primary,
                                }}
                            />
                        </View>
                    )
                }}
            />
    </Tabs>
  );
};

export default Layout;

const styles = StyleSheet.create({
  logoutText: {
    marginRight: 10,
    color: 'blue',
  },
  createIconContainer: {
    backgroundColor: Colors.itemBackground,
    borderRadius: 8,
    padding: 6,
  },
});
