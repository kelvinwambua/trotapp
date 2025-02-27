import React, { useState } from 'react';
import { View, Text,Image, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sammy', text: 'Hey there!', isUser: false },
    { id: 2, sender: 'You', text: 'Hi Sammy! How’s it going?', isUser: true },
    { id: 3, sender: 'Sammy', text: 'I wanted to ask about the car rental.', isUser: false },
    { id: 4, sender: 'You', text: 'Sure! What do you need to know?', isUser: true },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [image,setImage]=useState(null);

  const sendMessage = () => {
    if (newMessage.trim().length === 0) return; 

    const newMsg = {
      id: messages.length + 1,
      sender: 'You',
      text: newMessage,
      isUser: true,
      image:image
    };

    setMessages([...messages, newMsg]); 
    setNewMessage('');
    setImage(null) 
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(auth)/(messages)/')}>
          <MaterialIcons name='arrow-back' size={30} color={'#007AFF'} />
        </TouchableOpacity>
        <Text style={styles.title}>Sammy</Text>
      </View>

      <ScrollView style={styles.chatContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.senderBubble
            ]}
          >
            {message.text ? <Text style={message.isUser ? styles.senderMsgTxt : styles.receiverMsgText}>{message.text}</Text> : null}
            {message.image && <Image source={{ uri: message.image }} style={styles.image} />}
          </View>
        ))}
      </ScrollView>

      {image && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity onPress={() => setImage(null)}>
            <MaterialIcons name="cancel" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <MaterialIcons name="photo" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <MaterialIcons name='send' size={24} color={'#FFF'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#007AFF',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
  },
  senderBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  receiverMsgText: {
    fontSize: 16,
    color: '#333',
    fontFamily:'DMSans_700Bold'
  },
  senderMsgTxt:{
    fontSize: 16,
    color: 'white',
    fontFamily:'DMSans_700Bold'
  },
  image:{
    width: 200,
    height: 150, 
    borderRadius: 10, 
    marginTop: 5
  },
  imagePreview:{
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    backgroundColor: '#FFF', 
    borderTopWidth: 1, 
    borderColor: '#EEE'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#EEE',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 10,
  },
});

