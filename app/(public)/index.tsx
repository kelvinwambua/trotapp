import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import {Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')

    const {startOAuthFlow} = useOAuth({strategy: "oauth_facebook"});
    const {startOAuthFlow: startGoogleOAuthFlow} = useOAuth({strategy: "oauth_google"});

    const data = useQuery(api.users.getAllUsers);
    
    const onSignUpPress = async () => {
        if (!isLoaded) {
            return
        }

        try {
            await signUp.create({
                emailAddress,
                password,
            })

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            setPendingVerification(true)
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    const onPressVerify = async () => {
        if (!isLoaded) {
            return
        }

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId })
                router.replace('/')
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2))
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    const handleFacebookLogin = useCallback(async () => {
        try {
            const {createdSessionId, setActive} = await startOAuthFlow();
            if (createdSessionId && setActive) {
                await setActive({session: createdSessionId});
            }
        } catch (err) {
            console.error("OAuth error:", err);
        }
    }, [startOAuthFlow]);

    const handleGoogleLogin = useCallback(async () => {
        try {
            const {createdSessionId, setActive} = await startGoogleOAuthFlow();
            if (createdSessionId && setActive) {
                await setActive({session: createdSessionId});
            }
        } catch (err) {
            console.error("OAuth error:", err);
        }
    }, [startGoogleOAuthFlow]);

    const navigateToSignIn = () => {
        //router.push('/(public)/signin');  
    };

    return(
        <View style={styles.container}>
            <Image
                source={require("@/assets/images/car.jpg")}
                style={styles.loginImage}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Welcome to Trot</Text>
                    <Text style={styles.subtitle}>On Your Way, On Your Time</Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        value={emailAddress}
                        placeholder="Email"
                        placeholderTextColor="#666"
                        onChangeText={(email) => setEmailAddress(email)}
                    />
                    <TextInput
                        style={styles.input}
                        value={password}
                        placeholder="Password"
                        placeholderTextColor="#666"
                        secureTextEntry={true}
                        onChangeText={(password) => setPassword(password)}
                    />

                    <TouchableOpacity 
                        style={styles.signUpButton} 
                        onPress={onSignUpPress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.signUpButtonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity 
                            style={styles.socialButton} 
                            onPress={handleFacebookLogin}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={require("@/assets/images/facebook.png")}
                                style={styles.socialButtonIcon}
                            />
                            <Text style={styles.socialButtonText}>Facebook</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.socialButton} 
                            onPress={handleGoogleLogin}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={require("@/assets/images/google.png")}
                                style={styles.socialButtonIcon}
                            />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.signInContainer}>
                        <Text style={styles.signInText}>Already have an account?</Text>
                        <TouchableOpacity onPress={navigateToSignIn}>
                            <Text style={styles.signInLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    loginImage: {
        width: "100%",
        height: 300,
        resizeMode: "cover",
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
    signUpButton: {
        height: 52,
        backgroundColor: '#000',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#666',
        fontSize: 14,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    socialButton: {
        flex: 1,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        gap: 8,
    },
    socialButtonIcon: {
        width: 24,
        height: 24,
        resizeMode: "contain",
    },
    socialButtonText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 4,
    },
    signInText: {
        fontSize: 14,
        color: '#666',
    },
    signInLink: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
});