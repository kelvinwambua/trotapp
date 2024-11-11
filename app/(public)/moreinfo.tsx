import { useAuth } from '@clerk/clerk-expo';
import {Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function MoreInfo() {
    const router = useRouter();
    const { isLoaded } = useAuth();
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const onSubmit = async () => {
        if (!isLoaded) {
            return;
        }

        try {
        
            router.replace('/');
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
        }
    }

    return(
        <View style={styles.container}>
       
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Complete Your Profile</Text>
                    <Text style={styles.subtitle}>Tell us more about yourself</Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="words"
                        value={fullName}
                        placeholder="Full Name"
                        placeholderTextColor="#666"
                        onChangeText={(name) => setFullName(name)}
                    />
                    <TextInput
                        style={styles.input}
                        value={phoneNumber}
                        placeholder="Phone Number"
                        placeholderTextColor="#666"
                        keyboardType="phone-pad"
                        onChangeText={(phone) => setPhoneNumber(phone)}
                    />
                    

                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={onSubmit}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.submitButtonText}>Complete Profile</Text>
                    </TouchableOpacity>

                    <View style={styles.skipContainer}>
                        <Text style={styles.skipText}>Want to do this later?</Text>
                        <TouchableOpacity onPress={() => router.replace('/')}>
                            <Text style={styles.skipLink}>Skip for now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loginImage: {
        width: "100%",
        height: 300,
        resizeMode: "cover",
    },
    scrollContent: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
    formContainer: {
        padding: 24,
        gap: 16,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#f8f8f8',
    },
    submitButton: {
        height: 52,
        backgroundColor: '#000',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    skipContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 4,
    },
    skipText: {
        fontSize: 14,
        color: '#666',
    },
    skipLink: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    }
});