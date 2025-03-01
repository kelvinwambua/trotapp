import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUserProfile } from '@/hooks/useUserProfile';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const usePush = () => {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();
  const storePushToken = useMutation(api.pushTokens.storePushToken);
  const { userProfile } = useUserProfile();

  useEffect(() => {
    if (!Device.isDevice || !userProfile?._id) return;

    registerForPushNotificationsAsync()
      .then((token) => {
        if (token && userProfile?._id) {
          // Store token in the pushTokens table instead of updating user
          storePushToken({
            userId: userProfile._id,
            token: token,
            createdAt: new Date().toISOString(),
          });
        }
      })
      .catch((error: any) => console.log('error', error));

    // Received notification
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('received notification', notification);
    });

    // Tapped on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      // Handle different notification types
      if (data.bookingId) {
        router.push(`/(auth)/(profile)/bookings`);
      } else if (data.threadId) {
        router.push('/(auth)/(messages)/chat');
      } else if (data.postId) {
        router.push(`/(auth)/(profile)/bookings`);
      } else {
        // Default route for other notifications
        router.push('/(auth)/(profile)/bookings');
      }
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [userProfile?._id]);

  function handleRegistrationError(errorMessage: string) {
    console.error(errorMessage);
    return null;
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return handleRegistrationError('Permission not granted for push notifications');
      }
      
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      if (!projectId) {
        return handleRegistrationError('Project ID not found');
      }
      
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log('Push token obtained:', pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        return handleRegistrationError(`Error getting push token: ${e}`);
      }
    } else {
      return handleRegistrationError('Must use physical device for push notifications');
    }
  }
};