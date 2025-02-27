import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, Dimensions, Platform, StatusBar } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import React from "react";

const { width } = Dimensions.get('window');

const SavedCarsScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_700Bold,
    });
    
    const convexUser = useQuery(api.users.current);
    const savedPosts = useQuery(api.post.getSavedPosts, { userId: convexUser?._id! });

    const handleCarPress = (carId: string) => {
        const selectedCar = savedPosts?.find(post => post._id === carId);
        // if (selectedCar?.status === 'inactive') {
        //     return; 
        // }
        router.push({
            pathname: "/(auth)/(tabs)/(profile)/car-details/[id]",
            params: { id: carId }
        });
    };

    if (!fontsLoaded || !savedPosts) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading saved cars...</Text>
            </View>
        );
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <Stack.Screen options={{ 
                headerShown: true,
                animation: 'slide_from_right',
                title: 'Saved Cars',
            }} />

            <View style={styles.container}>
                {/* <View style={[styles.header, { paddingTop: insets.top }]}>
                    <Text style={styles.headerTitle}>Saved Cars</Text>
                </View> */}

                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {savedPosts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="heart-outline" size={48} color="#666" />
                            <Text style={styles.emptyStateText}>No saved cars yet</Text>
                            <Text style={styles.emptyStateSubtext}>Cars you save will appear here</Text>
                        </View>
                    ) : (
                        savedPosts.map((post) => (
                            <TouchableOpacity
                                key={post._id}
                                style={styles.card}
                                onPress={() => handleCarPress(post._id)}
                            >
                                {post.carImageUrls?.[0] && (
                                    <Image
                                        source={{ uri: post.carImageUrls[0] }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                )}
                                
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View>
                                            <Text style={styles.carTitle}>
                                                {post.carMake} {post.carModel}
                                            </Text>
                                            <Text style={styles.carYear}>{post.carYear}</Text>
                                        </View>
                                        <Text style={styles.priceText}>{post.rentRange}</Text>
                                    </View>

                                    <View style={styles.cardDetails}>
                                        {post.carLocation && (
                                            <View style={styles.detailItem}>
                                                <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                                                <Text style={styles.detailText}>{post.carLocation}</Text>
                                            </View>
                                        )}
                                        {post.transmission && (
                                            <View style={styles.detailItem}>
                                                <MaterialCommunityIcons name="car-shift-pattern" size={16} color="#666" />
                                                <Text style={styles.detailText}>{post.transmission}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* <View style={[styles.statusBadge, { backgroundColor: getStatusColor(post.status) }]}>
                                        <Text style={styles.statusText}>
                                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                        </Text>
                                    </View> */}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>
        </>
    );
};

const getStatusColor = (status: 'active' | 'inactive' | 'pending'): string => {
    const colors = {
        active: '#34C759',
        inactive: '#FF9500',
        pending: '#007AFF'
    };
    return colors[status];
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
    },
    loadingText: {
        marginTop: 12,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 200,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    carTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
    },
    carYear: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginTop: 2,
    },
    priceText: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#007AFF',
    },
    cardDetails: {
        flexDirection: 'row',
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: '#FFF',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyStateText: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginTop: 8,
    },
});

export default SavedCarsScreen;