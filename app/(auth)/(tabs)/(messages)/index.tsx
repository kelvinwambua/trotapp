import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MessagesScreen() {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedNotification, setExpandedNotification] = useState(null);

  const messages = [
    { id: 1, sender: 'Sammy', text: 'Hello ...', unread: true },
    { id: 2, sender: 'James Mwololo', text: 'Come pick up your car today', unread: true },
    { id: 3, sender: 'Kerry Luvai', text: 'My car ran into an issue. What ...', unread: false },
    { id: 4, sender: 'Joab Bodo', text: 'Hello, I would like to rent your Toyota...', unread: false },
  ];

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = message.sender.toLowerCase().includes(searchQuery.toLowerCase()) || message.text.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Unread') return matchesSearch && message.unread;
    if (activeFilter === 'Read') return matchesSearch && !message.unread;
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Heading for Messages and Notifications */}
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>Messages</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/(messages)/NotificationsScreen')}>
          <Text style={styles.heading}>Notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.searchBar}>
          <MaterialIcons name='search' size={15} />
          <TextInput style={{ width: '90%' }} placeholder='Search messages' value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        {/* <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.notifications}>
          <MaterialIcons name='notification-important' size={40} color={'#007AFF'} />
        </TouchableOpacity> */}
      </View>

      <View style={styles.upperBar}>
        <ScrollView contentContainerStyle={styles.filterContainer} horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'Unread', 'Read'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filter, activeFilter === filter && styles.activeFilter]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={styles.filterTxt}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.messageContainer}>
        {filteredMessages.map((message) => (
          <TouchableOpacity onPress={() => router.push('/(auth)/(messages)/chat')} key={message.id} style={styles.messageBox}>
            <View style={styles.Left}>
              <MaterialIcons size={60} name='account-circle' />
              <View style={styles.text}>
                <Text style={styles.username}>{message.sender}</Text>
                <Text style={styles.userTxt}>{message.text}</Text>
              </View>
            </View>
            <View style={styles.Right}>
              <Text style={styles.time}>10:13</Text>
              {message.unread && <MaterialIcons size={30} name='notifications-on' color={'#007AFF'} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  searchBar: {
    width: '100%',
    height: 40,
    backgroundColor: '#EEE',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    margin: 10,
  },
  messageContainer: {
    width: '100%',
  },
  messageBox: {
    flexDirection: 'row',
    height: 80,
    width: '100%',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    justifyContent: 'flex-start',
  },
  username: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
  },
  userTxt: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  Left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Right: {
    justifyContent: 'flex-end',
  },
  filter: {
    borderRadius: 15,
    backgroundColor: '#007AFF',
    height: 30,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    gap: 5,
  },
  filterTxt: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: 'white',
  },
  upperBar: {
    flexDirection: 'row',
  },
  notifications: {
    position: 'relative',
  },
  time: {
    fontFamily: 'DMSans_700Bold',
  },
});