import React, { useState } from "react";
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router, Stack } from "expo-router";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get('window');

const BookingsIndexScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const convexUser = useQuery(api.users.current);
    const bookingStats = useQuery(api.booking.getBookingStats, { 
        userId: convexUser?._id! 
    });
    const recentBookings = useQuery(api.booking.getRecentBookings, {
        userId: convexUser?._id!,
        limit: 20
    });
    
    console.log(recentBookings)
    console.log(bookingStats)
    if (!recentBookings || !bookingStats) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading your bookings...</Text>
            </View>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return '#22C55E';
            case 'completed':
                return '#3B82F6';
            case 'cancelled':
                return '#EF4444';
            case 'pending':
                return '#F59E0B';
            default:
                return '#71717A';
        }
    };

    const renderBookingCard = (booking: any) => (
        <TouchableOpacity 
            key={booking._id} 
            style={styles.bookingCard}
            // onPress={() => router.push(`/bookings/${booking._id}`)}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <Image 
                    source={
                        booking.post?.carImageUrls?.[0] 
                            ? { uri: booking.post.carImageUrls[0] }
                            : require('@/assets/images/car.jpg')
                    }
                    style={styles.carImage}
                />
                <BlurView intensity={80} style={styles.priceBadge}>
                    <Text style={styles.priceText}>{booking.post?.rentRange}</Text>
                </BlurView>
            </View>

            <View style={styles.bookingInfo}>
                <View style={styles.headerRow}>
                    <Text style={styles.carName} numberOfLines={1}>
                        {booking.post?.carMake} {booking.post?.carModel} {booking.post?.carYear}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                        <Text style={styles.statusText}>{booking.status}</Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
                    <Text style={styles.location} numberOfLines={1}>
                        {booking.post?.carLocation}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="calendar-range" size={16} color="#6B7280" />
                    <Text style={styles.dateText}>
                        {format(new Date(booking.startDate), 'MMM dd')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.userInfo}>
                        <Image 
                            source={
                                booking.owner?.imageUrl 
                                    ? { uri: booking.owner.imageUrl }
                                    : require('@/assets/images/car.jpg')
                            }
                            style={styles.userAvatar}
                        />
                        <Text style={styles.username}>{booking.owner?.username || 'Unknown User'}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <>
              <Stack.Screen options={{ 
                       headerShown: true,
                       animation: 'slide_from_right',
                       title: 'My Bookings',
                   }} />
       
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <Text style={styles.headerTitle}>My Bookings</Text>
            </View> */}

            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{bookingStats.active || 0}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={[styles.statItem, styles.statBorder]}>
                    <Text style={styles.statNumber}>{bookingStats.completed || 0}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{bookingStats.total || 0}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                        Upcoming
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                        Past
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {recentBookings
                    .filter(booking => {
                        const isUpcoming = new Date(booking.startDate) > new Date();
                        return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
                    })
                    .map(renderBookingCard)}
            </ScrollView>
        </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1E293B',
    },
    stats: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E2E8F0',
    },
    statNumber: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#64748B',
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#64748B',
    },
    activeTabText: {
        color: '#007AFF',
        fontFamily: 'DMSans_700Bold',
    },
    scrollContent: {
        padding: 16,
    },
    bookingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    imageContainer: {
        position: 'relative',
    },
    carImage: {
        width: '100%',
        height: 200,
    },
    priceBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        overflow: 'hidden',
    },
    priceText: {
        color: '#FFFFFF',
        fontFamily: 'DMSans_700Bold',
        fontSize: 16,
    },
    bookingInfo: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    carName: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1E293B',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'DMSans_700Bold',
        textTransform: 'capitalize',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    location: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#64748B',
        marginLeft: 8,
        flex: 1,
    },
    dateText: {
        marginLeft: 8,
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#64748B',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 8,
    },
    username: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#1E293B',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#64748B',
    },
});

export default BookingsIndexScreen;