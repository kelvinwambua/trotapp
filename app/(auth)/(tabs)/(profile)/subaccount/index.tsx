import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SubAccountSetupScreen = () => {
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_700Bold,
    });

    const [formData, setFormData] = useState({
        accountNumber: '',
        bankName: '',
        bankCode: '',
        businessName: '',
        mobileNumber: '',
        splitRatio: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Your submission logic here
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <Stack.Screen 
                options={{ 
                    headerShown: true,
                    title: 'Setup Payment Account',
                    animation: 'slide_from_right',
                }} 
            />

            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bank Account Details</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Account Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter account number"
                            value={formData.accountNumber}
                            onChangeText={(text) => setFormData(prev => ({...prev, accountNumber: text}))}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Bank Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter bank name"
                            value={formData.bankName}
                            onChangeText={(text) => setFormData(prev => ({...prev, bankName: text}))}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Bank Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter bank code"
                            value={formData.bankCode}
                            onChangeText={(text) => setFormData(prev => ({...prev, bankCode: text}))}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Information</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Business Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter business name"
                            value={formData.businessName}
                            onChangeText={(text) => setFormData(prev => ({...prev, businessName: text}))}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter mobile number"
                            value={formData.mobileNumber}
                            onChangeText={(text) => setFormData(prev => ({...prev, mobileNumber: text}))}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Split Ratio (%)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter split percentage"
                            value={formData.splitRatio}
                            onChangeText={(text) => setFormData(prev => ({...prev, splitRatio: text}))}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <MaterialCommunityIcons name="information" size={24} color="#007AFF" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Important Note</Text>
                            <Text style={styles.infoText}>
                                Make sure all banking details are correct. This account will be used for receiving payments from rentals.
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'Setting up...' : 'Setup Payment Account'}
                    </Text>
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
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: 'DMSans_400Regular',
        backgroundColor: '#FFF',
    },
    infoSection: {
        padding: 16,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F0F9FF',
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
    submitButton: {
        backgroundColor: '#007AFF',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'DMSans_500Medium',
    }
});

export default SubAccountSetupScreen;