import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SupportCard = ({ 
    icon, 
    title, 
    subtitle,
    onPress 
}: { 
    icon: any, 
    title: string, 
    subtitle: string, 
    onPress: () => void 
}) => (
    <TouchableOpacity style={styles.supportCard} onPress={onPress}>
        <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={24} color="#007AFF" />
        </View>
        <View style={styles.supportInfo}>
            <Text style={styles.supportTitle}>{title}</Text>
            <Text style={styles.supportSubtitle}>{subtitle}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E0" />
    </TouchableOpacity>
);

const SupportScreen = () => {
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_700Bold,
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
                    title: 'Help & Support',
                    animation: 'slide_from_right',
                }} 
            />

            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>How can we help you?</Text>
                    <Text style={styles.headerSubtitle}>Choose a category below to find the help you need</Text>
                </View>

                <View style={styles.section}>
                    <SupportCard
                        icon="frequently-asked-questions"
                        title="FAQ"
                        subtitle="Browse frequently asked questions"
                        onPress={() => {}}
                    />

                    <SupportCard
                        icon="message-text-outline"
                        title="Chat Support"
                        subtitle="Talk to our customer service team"
                        onPress={() => {}}
                    />

                    <SupportCard
                        icon="email-outline"
                        title="Email Support"
                        subtitle="Send us an email"
                        onPress={() => {}}
                    />

                    <SupportCard
                        icon="phone-outline"
                        title="Call Support"
                        subtitle="Speak with a representative"
                        onPress={() => {}}
                    />
                </View>

                <View style={styles.emergencySection}>
                    <View style={styles.emergencyCard}>
                        <Ionicons name="warning-outline" size={24} color="#DC2626" />
                        <View style={styles.emergencyContent}>
                            <Text style={styles.emergencyTitle}>Emergency Support</Text>
                            <Text style={styles.emergencyText}>
                                For urgent assistance, call our 24/7 emergency hotline
                            </Text>
                            <TouchableOpacity style={styles.emergencyButton}>
                                <Text style={styles.emergencyButtonText}>Call Emergency Support</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={[styles.section, { marginTop: 16 }]}>
                    <Text style={styles.sectionTitle}>Popular Topics</Text>
                    {['Account Issues', 'Billing & Payments', 'Technical Support', 'Service Updates'].map((topic, index) => (
                        <TouchableOpacity 
                            key={index}
                            style={styles.topicButton}
                            onPress={() => {}}
                        >
                            <Text style={styles.topicText}>{topic}</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E0" />
                        </TouchableOpacity>
                    ))}
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
    header: {
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
    },
    section: {
        padding: 16,
        backgroundColor: '#FFF',
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'DMSans_700Bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    supportInfo: {
        flex: 1,
        marginLeft: 12,
    },
    supportTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    supportSubtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginTop: 2,
    },
    emergencySection: {
        padding: 16,
        marginTop: 16,
    },
    emergencyCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FED7D7',
    },
    emergencyContent: {
        flex: 1,
        marginLeft: 12,
    },
    emergencyTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        color: '#DC2626',
        marginBottom: 4,
    },
    emergencyText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginBottom: 12,
    },
    emergencyButton: {
        backgroundColor: '#DC2626',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    emergencyButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
    },
    topicButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    topicText: {
        fontSize: 16,
        fontFamily: 'DMSans_400Regular',
        color: '#1A1A1A',
    },
});

export default SupportScreen;