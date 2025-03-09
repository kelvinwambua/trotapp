import React, { useState } from 'react';
import { View, Text,Image, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sammy', text: 'Hey there!', isUser: false,time:'10:00AM' },
    { id: 2, sender: 'You', text: 'Hi Sammy! How’s it going?', isUser: true, time:'10:04AM' },
    { id: 3, sender: 'Sammy', text: 'I wanted to ask about the car rental.', isUser: false,time:'10:10AM' },
    { id: 4, sender: 'You', text: 'Sure! What do you need to know?', isUser: true,time:'10:12AM' },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [image,setImage]=useState(null);
  const [editingMessage,setEditingMessage]=useState(null)
  const [replyingTo,setReplyingTo]= useState(null)

  const sendMessage = () => {

    const currentTime=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
    if (newMessage.trim().length === 0) return; 
    
    if(editingMessage){
      setMessages(messages.map(msg=>msg.id===editingMessage.id? { ...msg, text: newMessage,time:currentTime }:msg))
      setEditingMessage(null)
    }else{
      const newMsg = {
        id: messages.length + 1,
        sender: 'You',
        text: newMessage,
        isUser: true,
        image:image,
        time:currentTime,
        replyTo:replyingTo? replyingTo.text:null
      };
    setMessages([...messages, newMsg]); 

    }

    

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

  const startEditing=(message)=>{
    setEditingMessage(message);
    setNewMessage(message.text)
  }

  const startReplying=(message)=>{
    setReplyingTo(message)
  }

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
          <TouchableOpacity onPress={()=>startReplying(message)}>
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.senderBubble
              ]}
            >
              {message.replyTo && <Text style={styles.replyText}>Replying to:{message.reply}</Text>}
              {message.text ? <Text style={message.isUser ? styles.senderMsgTxt : styles.receiverMsgText}>{message.text}</Text> : null}
              {message.image && <Image source={{ uri: message.image }} style={styles.image} />}
              <Text style={styles.timeTxt}>{message.time}</Text>
              {message.isUser &&(
                <TouchableOpacity onPress={()=> startEditing(message)}>
                  <MaterialIcons name='edit' size={20} color={'white'}></MaterialIcons>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {replyingTo &&(
        <View style={styles.replyingPreview}>
          <Text style={styles.replyText}> Replying to:{replyingTo.text}</Text>
          <TouchableOpacity onPress={()=>setReplyingTo(null)}>
            <MaterialIcons name='cancel' size={20} color={'red'}></MaterialIcons>
          </TouchableOpacity>
        </View>
      )

      }

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
          <MaterialIcons name="add" size={30} color="#007AFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <MaterialIcons name='send' size={24} color={'#007AFF'} />
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,

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
  timeTxt:{
    alignSelf: 'flex-end',
    fontSize: 12,
    color: 'white',
    marginTop: 5,
  },
  replyText: {
    fontSize: 14,
    color: 'grey',
    fontStyle: 'italic',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#EEE'
  },
  iconButton:{
    marginRight: 10

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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
  },
});

