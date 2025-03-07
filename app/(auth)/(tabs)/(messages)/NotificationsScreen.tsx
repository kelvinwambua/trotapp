import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const [notifications] = useState([
    { id: 1, sender: 'Jamie', content: 'Jamie has rented your car', details: 'Jamie picked up the car at 10 AM and will return it on Friday.', time: 'Today', read: false },
    { id: 2, sender: 'Alex', content: 'Alex sent a message', details: 'Alex asked about the car’s fuel efficiency and insurance details.', time: 'Today', read: false },
    { id: 3, sender: 'Sammy', content: 'Sammy has returned your car', details: 'Sammy returned the car at 5 PM yesterday.', time: 'Yesterday', read: false },
    { id: 4, sender: 'Kerry', content: 'Kerry has requested a rental', details: 'Kerry wants to rent your car for 3 days next week.', time: 'Last Week', read: false },
  ]);



  const groupNotificationsByTime = () => {
    const grouped = {};
    notifications.forEach(notification => {
      if (!grouped[notification.time]) {
        grouped[notification.time] = [];
      }
      grouped[notification.time].push(notification);
    });
    return grouped;
  };

  const groupedNotifications = groupNotificationsByTime();

  return (
    <View style={styles.container}>
      {/* Heading for Messages and Notifications */}
      <View style={styles.headingContainer}>
        <TouchableOpacity onPress={() => router.back()}
        >
          <Text style={styles.heading}>Messages</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Notifications</Text>
      </View>

    
      {/* Notifications List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.keys(groupedNotifications).map((time) => (
          <View key={time}>
            <Text style={styles.timeHeader}>{time}</Text>
            {groupedNotifications[time].map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationItem, notification.read && styles.readNotification]}
              >
                <MaterialIcons size={40} name='account-circle' color={'#007AFF'} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notiName}>{notification.sender}</Text>
                  <Text style={styles.notiContent}>{notification.content}</Text>
                  <Text style={styles.notiDetails}>{notification.details}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5F5F5',
  },
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  }
  ,actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 0, 
    marginBottom: 10,
    width: '100%',
  },
  actionButton: {
    flex: 1, 
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 10,
  },
  notiName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  notiContent: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  notiDetails: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  readNotification: {
    opacity: 0.6,
  },
  timeHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginVertical: 10,
    marginHorizontal: 15,
  },
});