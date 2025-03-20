
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform, Animated,
  StatusBar, RefreshControl, Image  
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Id } from '@/convex/_generated/dataModel';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

interface Message {
  _id: Id<"messages">;
  threadId: Id<"chats">;
  senderId: Id<"users">;
  content: string;
  timestamp: number;
  status: string;
  type: string;
  attachments?: Array<{
    type: string;
    url: string;
    name?: string;
    size?: number;
    duration?: number;
  }>;
  replyTo?: Id<"messages">;
  isDeleted?: boolean;
  deliveredTo?: Id<"users">[];
  readBy?: Id<"users">[];
  sender?: {
    _id: Id<"users">;
    username: string | null;
    imageUrl?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface User {
  _id: Id<"users">;
  clerkId: string;
  username: string | null;
  imageUrl?: string;
  first_name?: string | null;
  last_name?: string | null;
}

const ChatDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const threadId = id as Id<"chats">;
  const { isLoaded, isSignedIn, user } = useUser();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  
  const convexUser = useQuery(api.users.current);
  

  const messagesData = useQuery(
    api.messages.getMessages, 
    threadId ? { 
      threadId,
      limit: 30,
      cursor: cursor || undefined,
    } : "skip"
  );

  
  const participants = useQuery(
    api.messages.getChatParticipants,
    threadId ? { threadId } : "skip"
  );

  
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markThreadAsRead);
  const updateMessageStatus = useMutation(api.messages.updateMessageStatus);

  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  
  useEffect(() => {
    if (threadId && convexUser) {
      markAsRead({ threadId })
        .catch(error => console.error('Error marking thread as read:', error));
    }
  }, [threadId, convexUser, markAsRead]);

  
  useEffect(() => {
    if (!messagesData?.messages || !convexUser) return;
    
    const markAsDelivered = async () => {
      try {
        for (const msg of messagesData.messages) {
          if (msg.senderId !== convexUser._id && 
              (!msg.deliveredTo || !msg.deliveredTo.includes(convexUser._id))) {
            await updateMessageStatus({
              messageId: msg._id,
              status: "delivered"
            });
          }
        }
      } catch (error) {
        console.error('Error marking messages as delivered:', error);
      }
    };
    
    markAsDelivered();
  }, [messagesData?.messages, convexUser, updateMessageStatus]);

  
  const otherUser = participants?.find(p => p._id !== convexUser?._id);
  

  const chatTitle = useMemo(() => {
    if (!otherUser) return "Chat";
    
    return otherUser.firstName && otherUser.lastName 
      ? `${otherUser.firstName} ${otherUser.lastName}`
      : otherUser.username || "Chat";
  }, [otherUser]);

  
  const formattedMessages = useMemo(() => {
    if (!messagesData?.messages) return [];
    
    const msgs = [...messagesData.messages];
    const formattedMsgs: (Message | { type: 'date', date: string, timestamp: number })[] = [];
    
    let lastDate: string | null = null;
    let messagesToProcess = [...msgs];
    let processedMessages: Message[] = [];
    
    // Sort messages by timestamp in descending order (newest first)
    messagesToProcess.sort((a, b) => b.timestamp - a.timestamp);
    
    messagesToProcess.forEach(msg => {
      const messageDate = new Date(msg.timestamp);
      let dateString: string;
      
      if (isToday(messageDate)) {
        dateString = 'Today';
      } else if (isYesterday(messageDate)) {
        dateString = 'Yesterday';
      } else if (isThisYear(messageDate)) {
        dateString = format(messageDate, 'EEEE, MMMM d');
      } else {
        dateString = format(messageDate, 'MMMM d, yyyy');
      }
      
      if (dateString !== lastDate && processedMessages.length > 0) {

        formattedMsgs.push(...processedMessages);
        formattedMsgs.push({
          type: 'date',
          date: lastDate!,
          timestamp: processedMessages[0].timestamp
        });
        processedMessages = [];
      }
      
      lastDate = dateString;
      processedMessages.push(msg);
    });
    
    // Add the last batch of messages and their date header
    if (processedMessages.length > 0) {
      formattedMsgs.push(...processedMessages);
      formattedMsgs.push({
        type: 'date',
        date: lastDate!,
        timestamp: processedMessages[0].timestamp
      });
    }
    
    return formattedMsgs;
  }, [messagesData?.messages]);

  const loadMoreMessages = useCallback(async () => {
    if (!messagesData?.nextCursor || loadingMore) return;
    
    setLoadingMore(true);
    setCursor(messagesData.nextCursor);
    setLoadingMore(false);
  }, [messagesData?.nextCursor, loadingMore]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !convexUser?._id || !threadId) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const trimmedMessage = message.trim();
      setMessage(''); // Clear input right away for better UX
      
      await sendMessage({
        threadId,
        content: trimmedMessage,
        type: "text"
      });
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could restore the message text if sending failed
      setMessage(message);
    }
  }, [message, convexUser, threadId, sendMessage]);

  // Format time for message bubbles
  const formatMessageTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };
  
  if (!isLoaded || !isSignedIn || !fontsLoaded || !messagesData || !convexUser) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Render different item types
  const renderItem = ({ item, index }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateHeaderContainer}>
          <View style={styles.dateHeaderLine} />
          <Text style={styles.dateHeaderText}>{item.date}</Text>
          <View style={styles.dateHeaderLine} />
        </View>
      );
    }
    
    const isCurrentUser = item.senderId === convexUser._id;
    const showAvatar = !isCurrentUser && 
      (index === 0 || formattedMessages[index - 1].type === 'date' || 
       formattedMessages[index - 1].senderId !== item.senderId);
    
    // Determine message status icon
    let statusIcon: React.ReactNode | null = null;
    if (isCurrentUser) {
      if (item.readBy && item.readBy.some(id => id !== convexUser._id)) {
        statusIcon = <MaterialCommunityIcons name="check-all" size={16} color="#34B7F1" />;
      } else if (item.deliveredTo && item.deliveredTo.some(id => id !== convexUser._id)) {
        statusIcon = <MaterialCommunityIcons name="check-all" size={16} color="#8E8E93" />;
      } else {
        statusIcon = <MaterialCommunityIcons name="check" size={16} color="#8E8E93" />;
      }
    }
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          item.isDeleted && styles.deletedMessageBubble
        ]}>
          {item.isDeleted ? (
            <Text style={styles.deletedMessageText}>
              <MaterialCommunityIcons name="delete-outline" size={14} /> 
              This message was deleted
            </Text>
          ) : (
            <>
              <Text style={[
                styles.messageText,
                isCurrentUser ? styles.currentUserText : styles.otherUserText
              ]}>{item.content}</Text>
              
              <View style={styles.messageFooter}>
                <Text style={[
                  styles.messageTime,
                  isCurrentUser ? styles.currentUserTime : styles.otherUserTime
                ]}>{formatMessageTime(item.timestamp)}</Text>
                
                {isCurrentUser && statusIcon}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { paddingTop: insets.top, opacity: fadeAnim }
      ]}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Stack Screen Header */}
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              {otherUser?.imageUrl && (
                <Image
                  source={{ uri: otherUser.imageUrl }}
                  style={styles.headerImage}
                />
              )}
              <Text style={styles.headerTitleText}>
                {chatTitle}
              </Text>
            </View>
          ),
          headerShown: true,
          headerRight: () => (
            otherUser && (
              <Text style={[styles.onlineStatus, { marginRight: 8 }]}>
                Online
              </Text>
            )
          ),
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: false,
          headerBackTitle: "Messages",
        }}
      />
      
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={formattedMessages}
        renderItem={renderItem}
        keyExtractor={(item) => item.type === 'date' ? `date-${item.timestamp}` : item._id}
        contentContainerStyle={styles.messagesContainer}
        inverted={true}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(true)}
            progressViewOffset={50}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListFooterComponent={loadingMore ? (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        ) : null}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[
          styles.inputContainer,
          { paddingBottom: Math.max(12, insets.bottom) }
        ]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Message"
              placeholderTextColor="#8E8E93"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />
          </View>
          
          {message.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FC',
  },
  onlineStatus: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    color: '#4CAF50',
    marginRight: 10,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
    minWidth: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  currentUserBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 6,
    marginLeft: 40, 
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    marginRight: 40, 
  },
  deletedMessageBubble: {
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 22,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#1A1A1A',
  },
  deletedMessageText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#8E8E93',
    fontStyle: 'italic',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUserTime: {
    color: '#8E8E93',
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
    maxWidth: 100,
  },
  dateHeaderText: {
    fontSize: 13,
    fontFamily: 'DMSans_600Medium',
    color: '#8E8E93',
    marginHorizontal: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 10,
    minHeight: 44,
    maxHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#1A1A1A',
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -20,
  },
  headerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerTitleText: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    maxWidth: 200,
  },
});

export default ChatDetailScreen;