import { useOAuth } from '@clerk/clerk-expo';
import {Text, View, StyleSheet, Image, ScrollView, TouchableOpacity} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const {startOAuthFlow} = useOAuth({strategy: "oauth_facebook"});
  const {startOAuthFlow: startGoogleOAuthFlow} = useOAuth({strategy: "oauth_google"});
  const data = useQuery(api.users.current);
  console.log(data);
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

  return(
      <View style={styles.container}>
          <Image
              source={require("@/assets/images/car.jpg")}
              style={styles.loginImage}
          />
          <ScrollView>
              <Text style={styles.title}>Welcome to Trot</Text>
              <Text style={styles.subtitle}>Your Journey Begins Here</Text>
              <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                      style={styles.loginButton} 
                      onPress={handleFacebookLogin}
                      activeOpacity={0.7}
                  >
                      <View style={styles.loginButtonContent}>
                          <Image
                              source={require("@/assets/images/facebook.png")}
                              style={styles.loginButtonIcon}
                          />
                          <Text style={styles.loginButtonText}>Sign in with Facebook</Text>
                          <Ionicons name="arrow-forward" size={24} color="#000"/>
                      </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                      style={styles.loginButton} 
                      onPress={handleGoogleLogin}
                      activeOpacity={0.7}
                  >
                      <View style={styles.loginButtonContent}>
                          <Image
                              source={require("@/assets/images/google.png")}
                              style={styles.loginButtonIcon}
                          />
                          <Text style={styles.loginButtonText}>Sign in with Google</Text>
                          <Ionicons name="arrow-forward" size={24} color="#000"/>
                      </View>
                  </TouchableOpacity>
              </View>
          </ScrollView>
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      gap: 20,
      alignItems: 'center',
      backgroundColor: '#fff',
  },
  loginImage: {
      width: "100%",
      height: 350,
      resizeMode: "cover",
      borderRadius: 8,
  },
  title: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#000',
      marginBottom: 8,
  },
  subtitle: {
      fontFamily: 'DMSans_400Regular',
      fontSize: 16,
      textAlign: 'center',
      color: '#666',
      marginBottom: 32,
  },
  buttonContainer: {
      padding: 20,
      gap: 20,
      width: "100%",
      alignItems: 'center',
  },
  loginButton: {
      width: 300,
      height: 50,
      backgroundColor: "#fff",
      padding: 10,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: Colors.border,
      shadowColor: "#000",
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
  },
  loginButtonContent: {  
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
  },
  loginButtonIcon: {
      width: 24,
      height: 24,
      resizeMode: "contain",
  },
  loginButtonText: {
      fontFamily: 'DMSans_500Medium',
      fontSize: 16,
      color: '#000',
      flex: 1,
      marginLeft: 10,
  }
})