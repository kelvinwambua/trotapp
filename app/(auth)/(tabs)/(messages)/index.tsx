import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import { Id } from '@/convex/_generated/dataModel';
import MessagesScreen from './MessagesScreen';  


type NotificationType = 'post_liked' | 'post_commented' | 'booking_request' | 'booking_approved' | 
  'booking_rejected' | 'user_followed' | 'message_received' | 'payment_received' | 'payment_requested';


type RelatedEntity = {
  type: 'post' | 'user' | 'booking' | 'message';
  title?: string;
  name?: string;
  imageUrl?: string;
  dates?: string;
  status?: string;
  carDetails?: string | null;
  sender?: string | null;
  preview?: string;
};

interface Notification {
  _id: Id<'notifications'>;
  userId: Id<'users'>;
  type: NotificationType;
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: Id<'posts' | 'users' | 'bookings' | 'messages'>;
  priority: 'low' | 'normal' | 'high';
  actionUrl?: string;
  expiresAt?: string;
  relatedEntity?: RelatedEntity | null;
}

const NotificationsTabScreen = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const convexUser = useQuery(api.users.current);
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );
  const unreadNotificationCount = useQuery(
    api.notifications.getUnreadNotificationCount,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const markNotificationRead = useMutation(api.notifications.markNotificationRead);
  const markAllNotificationsRead = useMutation(api.notifications.markAllNotificationsRead);

  const handleNotificationPress = useCallback((notification: Notification) => {
    
    markNotificationRead({ notificationId: notification._id });

  
    if (notification.actionUrl) {
    
      router.push(notification.actionUrl);
    } else if (notification.relatedEntity) {
    
      switch (notification.relatedEntity.type) {
        case 'post':
          router.push({
            pathname: "/(tabs)/profile",
            params: { id: notification.relatedId }
          });
          break;
        case 'user':
          router.push({
            pathname: "/(auth)/(profile)/",
            params: { id: notification.relatedId }
          });
          break;
        case 'booking':
          router.push({
            pathname: "/(auth)/(profile)/",
            params: { id: notification.relatedId }
          });
          break;
        case 'message':
          router.push({
            pathname: "/(messages)/[id]",
            params: { id: notification.relatedId! }
          });
          break;
      }
    }
  }, [markNotificationRead]);

  const handleMarkAllRead = useCallback(() => {
    if (convexUser?._id) {
      markAllNotificationsRead({ userId: convexUser._id });
    }
  }, [convexUser, markAllNotificationsRead]);

  if (!isLoaded || !isSignedIn || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
    
  
    let iconName = 'bell-outline';
    let iconColor = '#007AFF';
    
    if (item.type.includes('post')) {
      iconName = 'post-outline';
    } else if (item.type.includes('booking')) {
      iconName = 'calendar-check-outline';
      if (item.type === 'booking_approved') {
        iconColor = '#34C759';
      } else if (item.type === 'booking_rejected') {
        iconColor = '#FF3B30';
      }
    } else if (item.type.includes('message')) {
      iconName = 'chat-outline';
    } else if (item.type.includes('payment')) {
      iconName = 'currency-usd';
      iconColor = '#30B634';
    } else if (item.type.includes('user')) {
      iconName = 'account-outline';
    }
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem,
          item.isRead ? styles.notificationRead : styles.notificationUnread
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.notificationIcon, { backgroundColor: `${iconColor}15` }]}>
          <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>{item.content}</Text>
          
          {item.relatedEntity && (
            <View style={styles.relatedEntityContainer}>
              {item.relatedEntity.imageUrl && (
                <Image 
                  source={{ uri: item.relatedEntity.imageUrl }} 
                  style={styles.relatedEntityImage} 
                />
              )}
              
              {item.relatedEntity.type === 'post' && item.relatedEntity.title && (
                <Text style={styles.relatedEntityText}>{item.relatedEntity.title}</Text>
              )}
              
              {item.relatedEntity.type === 'booking' && item.relatedEntity.dates && (
                <Text style={styles.relatedEntityText}>
                  {item.relatedEntity.carDetails && `${item.relatedEntity.carDetails} • `}
                  {item.relatedEntity.dates}
                </Text>
              )}
              
              {item.relatedEntity.type === 'message' && item.relatedEntity.preview && (
                <Text style={styles.relatedEntityText} numberOfLines={1}>
                  {item.relatedEntity.preview}
                </Text>
              )}
            </View>
          )}
          
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
        
        {!item.isRead && (
          <View style={styles.unreadIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'messages' ? 'Messages' : 'Notifications'}
        </Text>
        
        {activeTab === 'notifications' && notifications && notifications.length > 0 && (
          <TouchableOpacity 
            style={styles.markAllReadButton}
            onPress={handleMarkAllRead}
          >
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
        
        {activeTab === 'messages' && (
          <TouchableOpacity 
            style={styles.newMessageButton}
            onPress={() => {/* Navigate to new message */}}
          >
            <MaterialCommunityIcons name="pencil" size={22} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'messages' && styles.activeTab
          ]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'messages' && styles.activeTabText
          ]}>
            Messages
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'notifications' && styles.activeTab
          ]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'notifications' && styles.activeTabText
          ]}>
            Notifications
          </Text>
          {unreadNotificationCount && unreadNotificationCount.count > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadNotificationCount.count > 99 ? '99+' : unreadNotificationCount.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === 'messages' ? (
        <MessagesScreen />
      ) : (
        <>
          {notifications === undefined ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bell-outline" size={60} color="#CCCCCC" />
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>You're all caught up!</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
  },
  newMessageButton: {
    padding: 10,
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllReadButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllReadText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    color: '#007AFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontFamily: 'DMSans_700Bold',
  },
  notificationBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notificationBadgeText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
    paddingHorizontal: 4,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  notificationUnread: {
    backgroundColor: '#F0F8FF',
  },
  notificationRead: {
    backgroundColor: '#FFF',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 15,
    fontFamily: 'DMSans_500Medium',
    color: '#1A1A1A',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  relatedEntityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  relatedEntityImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 8,
  },
  relatedEntityText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#8E8E93',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignSelf: 'center',
  },
});

export default NotificationsTabScreen;