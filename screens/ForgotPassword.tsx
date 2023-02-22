import { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ToastAndroid,
} from "react-native";
import { supabase } from "../config/supabase";

const ForgotPassword = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSendEmail = async () => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw error;
      }
      console.log(data);
      ToastAndroid.show("Email has been sent!", ToastAndroid.SHORT);
      setIsEmailSent(true);
    } catch (error: any) {
      setError(error.message);
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>We are so excited to see you again</Text>
        <Text style={styles.text}>Forgot Password</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="grey"
          placeholder="Email"
        />
        <View style={styles.dontContainer}>
          <Text
            style={styles.donthaveanaccount}
            onPress={() => navigation.navigate("SignUpScreen")}
          >
            Return to SignUp
          </Text>
          <Text
            style={styles.donthaveanaccount}
            onPress={() => navigation.navigate("LoginScreen")}
          >
            Return to Login
          </Text>
        </View>

        <Pressable style={styles.button} onPress={handleSendEmail}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
        {isEmailSent && (
          <Text style={styles.sendemail}>Email has been sent!</Text>
        )}
        {error !== "" && <Text style={{ color: "red" }}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#36393E",
    flex: 1,
    padding: 10,
    paddingVertical: 30,
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 10,
  },
  subtitle: {
    color: "lightgrey",
    fontSize: 20,
    alignSelf: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#202225",
    marginVertical: 5,
    padding: 15,
    color: "white",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#5964E8",
    alignItems: "center",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  donthaveanaccount: {
    color: "#4CABEB",
    marginVertical: 5,
  },
  text: {
    flex: 1,
    color: "white",
    fontWeight: "bold",
    marginVertical: 5,
  },
  dontContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#36393E",
  },
  sendemail: {
    color: "green",
    alignSelf: "center",
    marginVertical: 10,
    fontSize: 20,
  },
});
