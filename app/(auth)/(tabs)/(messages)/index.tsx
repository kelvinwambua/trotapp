import React, { useState } from 'react';
import { View, Text, StyleSheet,ScrollView, TouchableOpacity, TextInput,Modal } from 'react-native';
// import { ScrollView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MessagesScreen() {

  const [filterModalVisible,setFilterModalVisible]=useState(false)
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

  const [notifications, setNotifications] = useState([
    { id: 1, sender: 'Jamie', content: 'Jamie has rented your car', details: 'Jamie picked up the car at 10 AM and will return it on Friday.', read: false },
    { id: 2, sender: 'Alex', content: 'Alex sent a message', details: 'Alex asked about the car’s fuel efficiency and insurance details.', read: false },
  ]);


  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.searchBar}>
          <MaterialIcons name='search' size={15} />
          <TextInput style={{ width: '90%' }} placeholder='Search messages' value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.notifications}>
          <MaterialIcons name='notification-important' size={40} color={'#007AFF'} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={filterModalVisible}
        animationType='fade'
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <MaterialIcons name='close' size={30} color={'#333'} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Notifications</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={markAllAsRead} style={styles.actionButton}>
                <Text style={styles.actionText}>Mark All as Read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearNotifications} style={styles.actionButton}>
                <Text style={styles.actionText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationItem, notification.read && styles.readNotification]}
                  onPress={() => setExpandedNotification(expandedNotification === notification.id ? null : notification.id)}
                >
                  <MaterialIcons size={40} name='account-circle' color={'#007AFF'} />
                  <View>
                    <Text style={styles.notiName}>{notification.sender}</Text>
                    <Text style={styles.notiContent}>{notification.content}</Text>
                    {expandedNotification === notification.id && (
                      <Text style={styles.notiDetails}>{notification.details}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      
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
          <TouchableOpacity onPress={()=>{
            router.push('/(auth)/(messages)/chat')
          }} key={message.id} style={styles.messageBox}>
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
    // flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    padding:10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  messageContainer:{
      width:'100%',
      // padding:5
  },
  messageBox:{
      flexDirection:'row',
      height:80,
      width:'100%',
      // backgroundColor:'white',
      borderRadius:10,
      padding:10,
      margin:10,
      alignItems:'center',
      justifyContent:'space-between',
      // paddingRight:10
  },
  text:{
      justifyContent:'flex-start'
  },
  username:{
    fontSize:20,
    fontFamily:'DMSans_700Bold'
  },
  userTxt:{
    fontSize:12,
    fontFamily:'DMSans_700Bold'
  },
  Left:{
    flexDirection:'row',
    alignItems:'center'
  },
  Right:{
    justifyContent:'flex-end'
  },
  filter:{
    borderRadius:15,
    backgroundColor:'#007AFF',
    height:30,
    padding:6,
    justifyContent:'center',
    alignItems:'center',
    
  },
  filterContainer:{
    gap:5,
    // justifyContent:'flex-start'
    // height:20,

  },
  filterTxt:{
      fontSize:16,
      fontFamily:'DMSans_700Bold',
      color:'white'

  },
  upperBar:{
    flexDirection:'row'
  },
  notifications:{
    position:'relative'
  },
  notificationNumber:{
    position:'absolute',
    right:5,
    top:0

  },
  time:{
      fontFamily:'DMSans_700Bold'
  },
  searchBar:{
      width:'80%',
      height:40,
      backgroundColor:'grey',
      borderRadius:16,
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      padding:5,
      margin:10
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    height:100
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  notificationContainer:{
      padding:10,
      
  },
  modalSubTitle:{
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    justifyContent:'flex-start'
  },
  notification:{
    flexDirection:'row',
    // width:'100%',
    // backgroundColor:'grey',
    borderRadius:15,
    marginTop:15

  },
  notificationItem:{
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  notiName:{
    fontSize:20,
    fontFamily:'DMSans_700Bold',
    // color:'white',
  },
  notiContent:{
    fontSize:14,
    fontFamily:'DMSans_700Bold',
    // color:'white'
  },
  activeFilter:{
    backgroundColor: '#005BBB'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiDetails:{
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  closeButton:{
    
  }
  // today:{
  //   height:200
  // },
  // earlier:{
  // height:200

  // }
});
