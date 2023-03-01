import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const stripepublishablekey = Constants?.manifest?.extra?.stripePublishableKey;

  // console.log("stripepublishablekey", stripepublishablekey);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <StripeProvider publishableKey={stripepublishablekey}>
          <Navigation colorScheme={colorScheme} />
        </StripeProvider>
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
