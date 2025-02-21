import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Dimensions, Platform, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const PaymentMethodCard = ({ 
    icon, 
    title, 
    subtitle, 
    isDefault = false,
    onPress 
}: { 
    icon: string, 
    title: string, 
    subtitle: string, 
    isDefault?: boolean,
    onPress: () => void 
}) => (
    <TouchableOpacity style={styles.methodCard} onPress={onPress}>
        <View style={styles.methodIconContainer}>
            <FontAwesome name={icon} size={24} color="#007AFF" />
        </View>
        <View style={styles.methodInfo}>
            <Text style={styles.methodTitle}>{title}</Text>
            <Text style={styles.methodSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.methodAction}>
            {isDefault && (
                <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                </View>
            )}
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E0" />
        </View>
    </TouchableOpacity>
);

const PaymentMethodsScreen = () => {
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
                    title: 'Payment Methods',
                    animation: 'slide_from_right',
                }} 
            />

            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Payment Methods</Text>
                    
                    <PaymentMethodCard
                        icon="credit-card"
                        title="Credit/Debit Cards"
                        subtitle="Visa, Mastercard, American Express"
                        isDefault={true}
                        onPress={() => {}}
                    />

                    <PaymentMethodCard
                        icon="paypal"
                        title="PayPal"
                        subtitle="Connect your PayPal account"
                        onPress={() => {}}
                    />

                    <PaymentMethodCard
                        icon="phone"
                        title="M-PESA"
                        subtitle="Pay via M-PESA mobile money"
                        onPress={() => {}}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <View style={styles.transactionCard}>
                        <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                        <Text style={styles.transactionText}>
                            Your recent transactions will appear here
                        </Text>
                    </View>
                </View>

                <View style={styles.addMethodSection}>
                    <TouchableOpacity style={styles.addMethodButton}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#007AFF" />
                        <Text style={styles.addMethodText}>Add New Payment Method</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <MaterialCommunityIcons name="shield-check" size={24} color="#34C759" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Secure Payments</Text>
                            <Text style={styles.infoText}>
                                All your payment information is stored securely and encrypted
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
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    methodIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodInfo: {
        flex: 1,
        marginLeft: 12,
    },
    methodTitle: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    methodSubtitle: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
        marginTop: 2,
    },
    methodAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    defaultBadge: {
        backgroundColor: '#E6F6ED',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    defaultText: {
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        color: '#34C759',
    },
    addMethodSection: {
        padding: 16,
        backgroundColor: '#FFF',
        marginBottom: 16,
    },
    addMethodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#007AFF',
        backgroundColor: '#F0F9FF',
    },
    addMethodText: {
        marginLeft: 8,
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#007AFF',
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
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    transactionText: {
        fontSize: 14,
        fontFamily: 'DMSans_400Regular',
        color: '#666',
    },
});

export default PaymentMethodsScreen;