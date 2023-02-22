import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  SafeAreaView,
  ToastAndroid,
  Image,
} from "react-native";
import { supabase } from "../config/supabase";

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError("");
    if (email === "" || password === "") {
      setError("Please fill in all fields");
      ToastAndroid.show("Please fill in all fields", ToastAndroid.SHORT);
      setLoading(false);
      return;
    }
    //make login request to supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image
          source={require("../assets/images/justaichatlogo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>We are so excited to see you again</Text>
        <Text style={styles.text}>LOGIN TO Account</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="grey"
          placeholder="Email"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="grey"
          placeholder="Password"
          secureTextEntry={true}
        />
        <View style={styles.dontContainer}>
          <Text
            style={styles.donthaveanaccount}
            onPress={() => navigation.navigate("SignUpScreen")}
          >
            Don't have an account?
          </Text>
          <Text
            style={styles.donthaveanaccount}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            Forgot password?
          </Text>
        </View>

        <Pressable style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        {loading ? <ActivityIndicator size="large" /> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
  logo: {
    alignSelf: "center",
    width: 300,
    height: 200,
    marginVertical: 20,
  },
});
