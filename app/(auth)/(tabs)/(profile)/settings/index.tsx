import React, { useState } from 'react';
 
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import{
StyleSheet, 
View, 
Text, 
ScrollView, 
Switch, 
TouchableOpacity, 
Platform,
StatusBar 
} from 'react-native';

const SettingItem = ({ 
icon, 
title, 
description, 
type = 'toggle',
value,
onPress,
onValueChange 
}: { 
icon: string;
title: string;
description?: string;
type?: 'toggle' | 'select';
value?: boolean;
onPress?: () => void;
onValueChange?: (value: boolean) => void;
}) => (
<View style={styles.settingItem}>
    <View style={styles.settingIcon}>
        <MaterialCommunityIcons name={icon} size={24} color="#007AFF" />
    </View>
    <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
    </View>
    {type === 'toggle' ? (
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#CBD5E0', true: '#007AFF' }}
            thumbColor="#FFFFFF"
        />
    ) : (
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E0" />
    )}
</View>
);

const SettingsScreen = () => {
const insets = useSafeAreaInsets();
const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
});

const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    darkMode: false,
    locationServices: true,
    autoPayments: false,
    biometric: true,
    dataSync: true,
});

if (!fontsLoaded) {
    return null;
}

return (
    <>
        <StatusBar barStyle="dark-content" />
        <Stack.Screen 
            options={{ 
                headerShown: true,
                title: 'Settings',
                animation: 'slide_from_right',
            }} 
        />

        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Preferences</Text>
                
                <SettingItem
                    icon="bell-outline"
                    title="Push Notifications"
                    description="Receive alerts about your bookings and messages"
                    value={settings.notifications}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
                />

                <SettingItem
                    icon="email-outline"
                    title="Email Notifications"
                    description="Get updates via email"
                    value={settings.emailNotifications}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, emailNotifications: value }))}
                />

                <SettingItem
                    icon="theme-light-dark"
                    title="Dark Mode"
                    description="Switch between light and dark themes"
                    value={settings.darkMode}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, darkMode: value }))}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Privacy & Security</Text>
                
                <SettingItem
                    icon="map-marker-outline"
                    title="Location Services"
                    description="Allow app to access your location"
                    value={settings.locationServices}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, locationServices: value }))}
                />

                <SettingItem
                    icon="fingerprint"
                    title="Biometric Authentication"
                    description="Use fingerprint or Face ID for login"
                    value={settings.biometric}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, biometric: value }))}
                />

                <SettingItem
                    icon="shield-check-outline"
                    title="Privacy Policy"
                    type="select"
                    onPress={() => {}}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Settings</Text>
                
                <SettingItem
                    icon="credit-card-outline"
                    title="Automatic Payments"
                    description="Enable automatic payment processing"
                    value={settings.autoPayments}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, autoPayments: value }))}
                />

                <SettingItem
                    icon="currency-usd"
                    title="Currency"
                    description="USD - United States Dollar"
                    type="select"
                    onPress={() => {}}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Info & Support</Text>
                
                <SettingItem
                    icon="frequently-asked-questions"
                    title="FAQ"
                    type="select"
                    onPress={() => {}}
                />

                <SettingItem
                    icon="headphones"
                    title="Contact Support"
                    type="select"
                    onPress={() => {}}
                />

                <SettingItem
                    icon="information-outline"
                    title="About"
                    description="Version 1.0.0"
                    type="select"
                    onPress={() => {}}
                />
            </View>

            <TouchableOpacity style={styles.logoutButton}>
                <MaterialCommunityIcons name="logout" size={24} color="#DC2626" />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

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
    marginBottom: 16,
    backgroundColor: '#FFF',
    paddingVertical: 8,
},
sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: '#1A1A1A',
    marginHorizontal: 16,
    marginVertical: 12,
},
settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
},
settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
},
settingContent: {
    flex: 1,
    marginLeft: 12,
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
logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
},
logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#DC2626',
},
});

export default SettingsScreen;