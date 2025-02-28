import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PayWithFlutterwave } from 'flutterwave-react-native';
import { useUser } from '@clerk/clerk-expo';


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
  const {user} = useUser();
    const insets = useSafeAreaInsets();
    const [selectedAmount, setSelectedAmount] = useState(1000);
    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_700Bold,
    });

    const generateTransactionRef = (length: number) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return `flw_tx_ref_${result}`;
    };

    const handleOnRedirect = (data: any) => {
        console.log("Payment response:", data);
        if (data.status === 'successful') {
            Alert.alert(
                'Payment Successful',
                `Transaction completed with ID: ${data.transaction_id}`,
                [{ text: 'OK' }]
            );
        } else if (data.status === 'cancelled') {
            Alert.alert(
                'Payment Cancelled',
                'You cancelled the payment',
                [{ text: 'OK' }]
            );
        } else {
            Alert.alert(
                'Payment Failed',
                'Something went wrong with your payment',
                [{ text: 'OK' }]
            );
        }
    };

    const handleOnAbort = () => {
        Alert.alert('Payment Aborted', 'You aborted the payment');
    };

    const handleOnError = (error: any) => {
        Alert.alert('Error', error.message);
    };

    const paymentConfig = {
        tx_ref: generateTransactionRef(10),
        authorization: 'FLWPUBK_TEST-2fea7362a78407ae0ed7d145e2e09b5c-X', 
        amount: selectedAmount,
        currency: 'KES', 
        customer: {
            email:user?.primaryEmailAddress?.emailAddress,
            phonenumber: '254712345678',
            name: user?.fullName,
        },
        payment_options: 'card,mpesa,ussd',
        customizations: {
            title: 'My Store Payment',
            description: 'Payment for items in cart',
            logo: 'https://github.com/shadcn.png'
        },
        meta: { 
            consumer_id: 23,
            consumer_mac: "92a3-912ba-1192a"
        },
        payment_plan: undefined
    };

    const CustomPaymentButton = ({ onPress, disabled, isInitializing }: any) => (
        <TouchableOpacity 
            style={[styles.flutterwaveButton, disabled && styles.disabledButton]}
            onPress={onPress}
            disabled={disabled || isInitializing}
        >
            <Text style={styles.flutterwaveButtonText}>
                {isInitializing ? 'Processing...' : `Pay KES ${selectedAmount} Now`}
            </Text>
        </TouchableOpacity>
    );

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
                    <Text style={styles.sectionTitle}>Quick Pay</Text>
                    <PayWithFlutterwave
                        onRedirect={handleOnRedirect}
                        onAbort={handleOnAbort}
                        onInitializeError={handleOnError}
                        options={paymentConfig}
                        customButton={(props) => (
                            <CustomPaymentButton {...props} />
                        )}
                    />
                </View>

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
                        icon="phone"
                        title="M-PESA"
                        subtitle="Pay via M-PESA mobile money"
                        onPress={() => {}}
                    />

                    <PaymentMethodCard
                        icon="money"
                        title="USSD"
                        subtitle="Pay using USSD code"
                        onPress={() => {}}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amount Options</Text>
                    <View style={styles.amountGrid}>
                        {[500, 1000, 2000, 5000].map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[
                                    styles.amountButton,
                                    selectedAmount === amount && styles.selectedAmount
                                ]}
                                onPress={() => setSelectedAmount(amount)}
                            >
                                <Text style={[
                                    styles.amountText,
                                    selectedAmount === amount && styles.selectedAmountText
                                ]}>
                                    KES {amount}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    flutterwaveButton: {
        backgroundColor: '#F5A623',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
        opacity: 0.7,
    },
    flutterwaveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'DMSans_700Bold',
        textAlign: 'center',
    },
    amountGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    amountButton: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    selectedAmount: {
        backgroundColor: '#F0F9FF',
        borderColor: '#007AFF',
    },
    amountText: {
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
        color: '#1A1A1A',
    },
    selectedAmountText: {
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