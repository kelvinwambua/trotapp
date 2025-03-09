import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!isLoaded || !isSignedIn || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const menuItems = [
    {
      id: 'cars',
      title: 'My Cars',
      subtitle: '2 active listings',
      icon: 'car-multiple',
      color: '#007AFF'
    },
    {
      id: 'bookings',
      title: 'Bookings',
      subtitle: '1 upcoming trip',
      icon: 'calendar-check',
      color: '#34C759'
    },
    {
      id: 'saved-cars',
      title: 'Saved Cars',
      subtitle: '12 cars saved',
      icon: 'heart',
      color: '#FF2D55'
    },
    {
      id: 'earnings',
      title: 'Earnings',
      subtitle: 'KES 45,000 this month',
      icon: 'wallet',
      color: '#5856D6'
    }
  ];

  const accountItems = [
    {
      id: 'track',
      title: 'Track Your Vehicles',
      icon: 'radar',
      status: 'Tracking'
    },
    {
      id: 'identity',
      title: 'Identity Verification',
      icon: 'shield-check-outline',
      status: 'Verified'
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      icon: 'credit-card-outline',
      status: '2 cards'
    },
    {
      id: 'subaccount',
      title: 'Accept Payments',
      icon: 'cash-multiple',
      status: 'Under Development'
   
    },
    {
      id: 'payment',
      title: 'Test Payments',
      icon: 'test-tube',
      status: 'Dev'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'bell-outline',
      status: 'On'
    },
    {
      id: 'notification',
      title: 'Push Notification Test',
      icon: 'bell-outline',
      status: 'Onss'
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      status: '24/7'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'cog-outline',
      status: 'Profile, security'
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#007AFF', '#00A2FF']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user.imageUrl }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialCommunityIcons name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.userEmail}>{user.emailAddresses[0].emailAddress}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Cars</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(`/(auth)/(tabs)/(profile)/${item.id}`)}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.accountList}>
          {accountItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.accountItem}
              onPress={() => router.push(`/(auth)/(tabs)/(profile)/${item.id}`)}
            >
              <View style={styles.accountItemLeft}>
                <MaterialCommunityIcons name={item.icon} size={24} color="#1A1A1A" />
                <Text style={styles.accountItemTitle}>{item.title}</Text>
              </View>
              <View style={styles.accountItemRight}>
                <Text style={styles.accountItemStatus}>{item.status}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#A3A3A3" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => signOut()}
      >
        <MaterialCommunityIcons name="logout" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Bottom Spacing */}
      <View style={{ height: insets.bottom + 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    marginTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  editAvatarButton: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#FFF',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'DMSans_700Bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#FFF',
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  menuItem: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  accountList: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountItemTitle: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
    color: '#1A1A1A',
  },
  accountItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountItemStatus: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    color: '#FF3B30',
  },
});

export default ProfileScreen;