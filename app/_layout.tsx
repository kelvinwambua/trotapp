import { Slot, SplashScreen, Stack } from "expo-router";
import  {ClerkProvider, ClerkLoaded, useAuth} from "@clerk/clerk-expo";
import { tokenCache } from "@/utils/cache";

import {useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold} from "@expo-google-fonts/dm-sans";
import { useEffect } from "react";
import {ConvexReactClient} from "convex/react";
import {ConvexProviderWithClerk} from "convex/react-clerk";


const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>
  saveToken: (key: string, token: string) => Promise<void>
  clearToken?: (key: string) => void
}

SplashScreen.preventAutoHideAsync();

const InitialLayouty = () => {
  const  [fontsLoaded] = useFonts({
    DMSans_400Regular, DMSans_500Medium, DMSans_700Bold
  });
  useEffect(() => {
    if (fontsLoaded){
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  return (
    <Slot/>
  );
}
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey!}
    tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>

      <InitialLayouty/>
      </ConvexProviderWithClerk>
    </ClerkLoaded>
    
    </ClerkProvider>
  
  );
}
