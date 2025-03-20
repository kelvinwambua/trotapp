
import React, { useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import { Id } from '@/convex/_generated/dataModel';

const MessagesScreen = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  
  const convexUser = useQuery(api.users.current);
  const chatThreads = useQuery(
    api.messages.getUserChatThreads, 
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );
  const unreadCount = useQuery(api.messages.getUnreadMessageCount);

  const navigateToChat = useCallback((threadId: Id<"chats">) => {
    router.push({
      pathname: "/(messages)/[id]",
      params: { id: threadId }
    });
  }, []);

  const navigateToNewMessage = useCallback(() => {
    // router.push("/(auth)/(tabs)/messages/new");
  }, []);

  if (!isLoaded || !isSignedIn || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const renderChatThread = ({ item }) => {
    const otherUser = item.otherParticipants[0];
    const lastMessage = item.latestMessage?.content || 'Start a conversation';
    const lastMessageTime = item.latestMessage?.timestamp 
      ? formatDistanceToNow(new Date(item.latestMessage.timestamp), { addSuffix: true })
      : 'Just now';
    
    return (
      <TouchableOpacity 
        style={styles.chatThreadItem}
        onPress={() => navigateToChat(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {otherUser?.imageUrl ? (
            <Image 
              source={{ uri: otherUser.imageUrl }} 
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {otherUser?.firstName?.[0] || otherUser?.username?.[0] || '?'}
              </Text>
            </View>
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {otherUser?.firstName && otherUser?.lastName 
                ? `${otherUser.firstName} ${otherUser.lastName}`
                : otherUser?.username || 'Unknown User'}
            </Text>
            <Text style={styles.timeText}>{lastMessageTime}</Text>
          </View>
          <Text 
            style={[
              styles.messagePreview,
              item.unreadCount > 0 && styles.unreadMessagePreview
            ]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {chatThreads === undefined ? (
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : chatThreads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chat-outline" size={60} color="#CCCCCC" />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation with someone</Text>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={navigateToNewMessage}
          >
            <Text style={styles.newChatButtonText}>New Message</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={chatThreads}
          renderItem={renderChatThread}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    marginBottom: 24,
  },
  newChatButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  newChatButtonText: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
  },
  listContent: {
    padding: 16,
  },
  chatThreadItem: {
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
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontFamily: 'DMSans_700Bold',
    color: '#888',
  },
  unreadBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
    paddingHorizontal: 4,
  },
  threadContent: {
    flex: 1,
    justifyContent: 'center',
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    flex: 1,
    paddingRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#8E8E93',
  },
  messagePreview: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#8E8E93',
  },
  unreadMessagePreview: {
    fontFamily: 'DMSans_500Medium',
    color: '#333',
  },
});

export default MessagesScreen;