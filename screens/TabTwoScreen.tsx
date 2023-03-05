import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";

import { Text, View } from "../components/Themed";
import { supabase } from "../config/supabase";

export default function TabTwoScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [shared, setShared] = useState(false);
  const rateUsOnAppStore = () => {
    //play store
    Linking.openURL("https://www.justideas.tech/justaichat-your-ai-assistant/");
  };

  const privacyPolicy = () => {
    //privacy policy link
    Linking.openURL("https://www.justideas.tech/privacy-policy/");
  };

  const TermsandConditions = () => {
    //terms and conditions link
    Linking.openURL("https://www.justideas.tech/terms-and-conditions/");
  };

  const ChatWithUS = () => {
    //chat with us link
    Linking.openURL("https://tawk.to/justaichat");
  };

  const handleShareOnWatsapp = async () => {
    //Watsapp share
    try {
      const result = await Share.share({
        message:
          "Hey there! I just discovered this amazing app that I think you'll love. It's packed with features that make [insert app purpose here] so much easier and more fun. Check it out for yourself and let me know what you think! #JustAiChat #JustAiChatApp Click here to download the app https://www.justideas.tech/justaichat-your-ai-assistant/",
      });

      if (result.action === Share.sharedAction) {
        setShared(true);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });
    //if user get full name and email
    if (user) {
      //get full name from database profile table
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .then(({ data, error }) => {
          if (error) {
            console.log("error", error);
            Alert.alert("Error", error.message);
          } else {
            setFullName(data[0].full_name);
          }
        });
    }
  }, [user]);

  const SignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw setError(error.message);
      setLoading(false);
    } catch (error: any) {
      console.log("error", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handlepass = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        user.email
      );
      if (error) {
        throw error;
      }
      console.log(data);
      setLoading(false);
      ToastAndroid.show("Password reset link sent to your email.", 1000);
    } catch (error: any) {
      setError(error.message);
      ToastAndroid.show(error.message, 1000);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <ScrollView style={styles.scroll}>
        <TouchableOpacity>
          <View style={styles.infoContainer}>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Name</Text>
              <Text style={styles.infoSubtitle}>
                {user ? fullName : "Loading..."}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <View style={styles.infoContainer}>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Email</Text>
              <Text style={styles.infoSubtitle}>
                {user ? user.email : "Loading..."}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={rateUsOnAppStore}>
          <View style={styles.infoContainerrateus}>
            <View style={styles.infoTextContainerrateus}>
              <Text style={styles.infoTitle}>
                Click and Rate us & Shine bright.
              </Text>
              <Text style={styles.infoSubtitle}>
                We've put a lot of hard work into creating this app, and it
                would mean the world to us if you could take a moment to rate us
                on the Play Store. Your support and feedback will help us
                continue to improve and provide a truly fantastic experience.
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShareOnWatsapp}>
          <View style={styles.infoContainerrateus}>
            <View style={styles.infoTextContainerrateus}>
              <Text style={styles.infoTitle}>
                Share this app with your friends and family.
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={privacyPolicy}>
          <View style={styles.infoContainerrateus}>
            <View style={styles.infoTextContainerrateus}>
              <Text style={styles.infoTitle}>Privacy Policy</Text>
              <Text style={styles.infoSubtitle}>
                Privacy Policy of Just Ai Chat
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={TermsandConditions}>
          <View style={styles.infoContainerrateus}>
            <View style={styles.infoTextContainerrateus}>
              <Text style={styles.infoTitle}>Terms and Service </Text>
              <Text style={styles.infoSubtitle}>
                Terms and Service of Just Ai Chat
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <View style={styles.infoContainerrateus}>
            <View style={styles.infoTextContainerrateus}>
              <Text style={styles.infoTitle}>Importent Note </Text>
              <Text style={styles.infoSubtitle}>
                Please Note All Messages is genrated by AI and not by any human
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={ChatWithUS}>
          <View style={styles.infoContainerrateus}>
            <View style={styles.infoTextContainerrateus}>
              <Text style={styles.infoTitle}>24/7 Support </Text>
              <Text style={styles.infoSubtitle}>
                Chat With Us 24/7 (Just Ai Chat Support Team Not AI)
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlepass}>
          <View style={styles.infoContainerlogoutres}>
            <View style={styles.infoTextContainerlogout}>
              <Text style={styles.infoTitle}>Reset Password</Text>
              <Text style={styles.infoSubtitle}></Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={SignOut}>
          <View style={styles.infoContainerlogout}>
            <View style={styles.infoTextContainerlogout}>
              <Text style={styles.infoTitle}>Logout</Text>
              <Text style={styles.infoSubtitle}></Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator style={styles.loadingIndicator} size="large" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  icon: {
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  infoContainer: {
    width: "90%",
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
    borderRadius: 10,
    marginLeft: 20,
    paddingLeft: 20,
  },
  infoContainerrateus: {
    width: "90%",
    padding: 15,
    backgroundColor: "#00ffff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
    borderRadius: 10,
    marginLeft: 20,
    paddingLeft: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTextContainerrateus: {
    flex: 1,
    backgroundColor: "#00ffff",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  infoSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  signOutButton: {
    marginTop: 20,
  },
  addchatview: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  infoTitleInput: {
    width: "100%",
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  iconAddChat: {
    position: "absolute",
    right: 10,
  },
  headerContainerok: {
    width: "100%",
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  scroll: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  errorText: {
    color: "red",
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  infoTextContainerlogout: {
    justifyContent: "center",
    alignContent: "center",
  },
  infoContainerlogout: {
    width: "90%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
    borderRadius: 10,
    marginLeft: 20,
    paddingLeft: 20,
    paddingTop: 20,
    borderWidth: 1,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  infoContainerlogoutres: {
    width: "90%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
    borderRadius: 10,
    marginLeft: 20,
    paddingLeft: 20,
    paddingTop: 20,
    borderWidth: 1,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
