
import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import {Text, View, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {  useCallback, useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useNavigation, useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo'
import React from 'react';
WebBrowser.maybeCompleteAuthSession();

export default function Index() {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title:'',	
        });
    }, [navigation]);
    const { isLoaded, signIn, setActive } = useSignIn()
    const router = useRouter()
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false)
    const [verificationEmail, setVerificationEmail] = useState('');
 

    const {startOAuthFlow} = useOAuth({strategy: "oauth_facebook"});
    const {startOAuthFlow: startGoogleOAuthFlow} = useOAuth({strategy: "oauth_google"});

    const data = useQuery(api.users.getAllUsers);
    
    const onSignInPress = React.useCallback(async () => {
        if (!isLoaded) {
          return
        }
    
        try {
          const signInAttempt = await signIn.create({
            identifier: emailAddress,
            password,
          })
    
          if (signInAttempt.status === 'complete') {
            await setActive({ session: signInAttempt.createdSessionId })
            router.replace('/')
          } else {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(signInAttempt, null, 2))
          }
        } catch (err: any) {
          console.error(JSON.stringify(err, null, 2))
        }
      }, [isLoaded, emailAddress, password])

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

    const navigateToSignUp = () => {
        router.push('/(public)')
    };

    console.log("Pending verification state:", pendingVerification);

    return(
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}> Sign In to Trot App</Text>
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
                        onPress={onSignInPress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.signUpButtonText}>Sign In</Text>
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
                        <Text style={styles.signInText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={navigateToSignUp}>
                            <Text style={styles.signInLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
        

          
         
            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    verificationContainer: {
        padding: 24,
        gap: 16,
        alignItems: 'center',
    },
    verificationTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    verificationSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    codeInputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    codeInput: {
        textAlign: 'center',
        letterSpacing: 1,
        fontSize: 20,
    },
    verifyButton: {
        width: '100%',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 4,
    },
    resendText: {
        fontSize: 14,
        color: '#666',
    },
    resendLink: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
});