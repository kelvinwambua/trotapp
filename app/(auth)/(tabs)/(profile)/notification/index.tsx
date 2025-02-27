import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, 
    shouldSetBadge: false,
  }),
});

export default function NotificationTestScreen() {
  const [status, setStatus] = useState('Checking permissions...');
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {

    if (Platform.OS === 'android') {
      setupNotificationChannel();
    }
    

    checkNotificationPermissions();
    

    const receivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setLastNotification(notification);
    });
    
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });
    

    return () => {
      Notifications.removeNotificationSubscription(receivedListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const setupNotificationChannel = async () => {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Notifications',
      importance: Notifications.AndroidImportance.MAX, 
      vibrationPattern: [0, 250, 250, 250, 250], 
      lightColor: '#FF231F7C',
      sound: 'default', 
      enableVibrate: true, 
    });
  };

  const checkNotificationPermissions = async () => {
    if (!Device.isDevice) {
      setStatus('Must use physical device for notifications');
      return;
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      setStatus('Permission not granted for notifications');
      return;
    }
    
    setStatus('Notification permissions granted');
  };

  const scheduleTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Go to sleep now",
          body: "Test notification",
          data: { test: 'This works even when app is closed' },
          sound: 'default', 
          vibrate: [0, 250, 250, 250], 
          priority: 'high', 
        },
        trigger: { 
          seconds: 1 
        },
      });
      
      setStatus('Notification scheduled! Close the app and wait 10 seconds.');
    } catch (error) {
      console.error('Error scheduling notification:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Test</Text>
      
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
      
      {lastNotification && (
        <View style={styles.notificationBox}>
          <Text style={styles.notificationTitle}>Last Received Notification:</Text>
          <Text>Title: {lastNotification.request.content.title}</Text>
          <Text>Body: {lastNotification.request.content.body}</Text>
          <Text>Data: {JSON.stringify(lastNotification.request.content.data)}</Text>
        </View>
      )}
      
      <Button
        title="Test Notification (10 seconds)"
        onPress={scheduleTestNotification}
      />
      
      <Text style={styles.instructions}>
        Press the button, then close the app.
        A notification with sound and vibration should appear after 10 seconds.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  statusText: {
    textAlign: 'center',
    fontSize: 16,
  },
  notificationBox: {
    backgroundColor: '#e9f5ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  notificationTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructions: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  }
});