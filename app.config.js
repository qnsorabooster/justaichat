import "dotenv/config";

export default {
  expo: {
    name: "justaichat",
    slug: "justaichat",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    // plgins: [
    //   "stripe-react-native",
    //   {
    //     "enableGooglePay": true,
    //   },
    // ],
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.justaichat.justaichat",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      supabaseurl: process.env.REACT_APP_SUPABASE_URL,
      supabasekey: process.env.REACT_APP_SUPABASE_KEY,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      eas: {
        projectId: "44e0650c-7dc1-4588-a36e-f5c8ccc7c6c3",
      },
    },
  },
};
