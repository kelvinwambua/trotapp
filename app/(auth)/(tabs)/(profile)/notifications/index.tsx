import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';

const NotificationSettingItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onValueChange 
}: { 
    icon: string, 
    title: string, 
    description: string, 
    value: boolean, 
    onValueChange: (value: boolean) => void 
}) => (
    <View style={styles.settingItem}>
        <View style={styles.settingIconContainer}>
            <MaterialCommunityIcons name={icon} size={24} color="#007AFF" />
        </View>
        <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{title}</Text>
            <Text style={styles.settingDescription}>{description}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#CBD5E0', true: '#007AFF' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? '#FFFFFF' : '#F4F4F5'}
        />
    </View>
);

const NotificationsScreen = () => {
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_700Bold,
    });

    const [notifications, setNotifications] = useState({
        bookingUpdates: true,
        messages: true,
        promotions: false,
        reminders: true,
        systemUpdates: true,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <>
            <Stack.Screen 
                options={{ 
                    headerShown: true,
                    title: 'Notifications',
                    animation: 'slide_from_right',
                }} 
            />

            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notification Preferences</Text>
                    
                    <NotificationSettingItem
                        icon="calendar-clock"
                        title="Booking Updates"
                        description="Get notified about your booking status and changes"
                        value={notifications.bookingUpdates}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, bookingUpdates: value }))}
                    />

                    <NotificationSettingItem
                        icon="message-text"
                        title="Messages"
                        description="Receive notifications for new messages"
                        value={notifications.messages}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, messages: value }))}
                    />

                    <NotificationSettingItem
                        icon="tag"
                        title="Promotions"
                        description="Stay updated with deals and special offers"
                        value={notifications.promotions}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, promotions: value }))}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Notifications</Text>

                    <NotificationSettingItem
                        icon="bell-ring"
                        title="Reminders"
                        description="Get reminded about upcoming bookings"
                        value={notifications.reminders}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, reminders: value }))}
                    />

                    <NotificationSettingItem
                        icon="update"
                        title="System Updates"
                        description="Important updates and system announcements"
                        value={notifications.systemUpdates}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, systemUpdates: value }))}
                    />
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <MaterialCommunityIcons name="information" size={24} color="#3B82F6" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Need Help?</Text>
                            <Text style={styles.infoText}>
                                You can change your notification preferences at any time in settings
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: insets.bottom + 20 }} />
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    section: {
        padding: 16,
        backgroundColor: '#FFF',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    settingTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    settingDescription: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginTop: 2,
    },
    infoSection: {
        padding: 16,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        lineHeight: 20,
    },
});

export default NotificationsScreen;