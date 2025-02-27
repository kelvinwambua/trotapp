import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Image, Text } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';


const Colors = {
  primary: '#3366FF',
  primaryLight: '#EEF3FF',
  background: '#F7F9FC',
  white: '#FFFFFF',
  black: '#222B45',
  gray: '#8F9BB3',
  lightGray: '#EDF1F7',
  borderGray: '#E4E9F2',
};

const CreateTabIcon = ({ focused }: { focused: boolean }) => (
  <View style={[
    styles.createIconContainer,
    focused && styles.focusedTabItem
  ]}>
    <MaterialIcons name="add" size={24} color={focused ? Colors.primary : Colors.gray} />
  </View>
);

const Layout = () => {
  const { user } = useUser();
  const router = useRouter();
  
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTitleStyle: {
          fontFamily: 'DMSans_700Bold',
          fontSize: 18,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.focusedTabItem]}>
              <MaterialIcons name="home" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.focusedTabItem]}>
              <MaterialIcons name="explore" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => <CreateTabIcon focused={focused} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/(modal)/create');
          },
        }}
      />
      <Tabs.Screen
        name="(messages)"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.focusedTabItem]}>
              <MaterialIcons name="inbox" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.profileTabContainer, focused && styles.focusedTabItem]}>
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileFallback}>
                  <Text style={styles.profileInitial}>{user?.firstName?.charAt(0) || 'U'}</Text>
                </View>
              )}
            </View>
          )
        }}
      />
    </Tabs>
  );
};

export default Layout;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    height: 60,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGray,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabIconContainer: {
    width: 48,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  focusedTabItem: {
    backgroundColor: Colors.primaryLight,
  },
  createIconContainer: {
    width: 48,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  profileTabContainer: {
    width: 48,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: Colors.white,
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
});