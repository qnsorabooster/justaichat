import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Button,
  TextInput,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  ToastAndroid,
  Image,
} from "react-native";
import { supabase } from "../config/supabase";

const SignUpScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    try {
      setLoading(true);
      if (email === "" || password === "" || name === "") {
        setError("Please fill in all fields");
        ToastAndroid.show("Please fill in all fields", ToastAndroid.SHORT);
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (!error) {
        Alert.alert(
          "Success",
          "Please check your email for the confirmation link"
        );
        ToastAndroid.show(
          "Please check your email for the confirmation link",
          ToastAndroid.SHORT
        );
        navigation.navigate("LoginScreen");
      }
    } catch (error: any) {
      setError(error.message);
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

        <Text style={styles.text}>ACCOUNT INFORMATION</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="grey"
          placeholder="Full name"
        />
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

        <Text
          style={styles.forgotPasswordText}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          Already have an account?
        </Text>

        <Pressable style={styles.button} onPress={onSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </Pressable>
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        {loading ? <ActivityIndicator size="large" /> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

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
  forgotPasswordText: {
    color: "#4CABEB",
    marginVertical: 5,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    marginVertical: 5,
  },
  logo: {
    width: 300,
    height: 200,
    alignSelf: "center",
    marginVertical: 20,
  },
});
