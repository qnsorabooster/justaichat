import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import * as Clipboard from "expo-clipboard";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";

const AIChatScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages]: any = useState([]);
  const [user, setUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [buttondisabled, setButtondisabled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
    const getData = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("aichatid", 1)
        .order("created_at", { ascending: true });
      if (error) {
        console.log("error", error);
        Alert.alert("Error", error.message);
      } else {
        setMessages(data);
      }
    };
    if (user) {
      getData();
    }
  }, [user]);

  const scrollToBottom = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleCopy = useCallback(async (message: any) => {
    const clipboardtext: string = message.toString();
    try {
      // await Clipboard.setStringAsync(clipboardtext);
      ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
    } catch (error: any) {
      console.log("error", error);
      ToastAndroid.show("Error copying to clipboard", ToastAndroid.SHORT);
    }
  }, []);

  const CheckMe = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("userid", user.id)
      .order("created_at", { ascending: true });
    if (error) {
      console.log("error", error);
      ToastAndroid.show("Error sending message", ToastAndroid.SHORT);
    } else {
      if (data.length > 10) {
        return data.length;
      }
    }
  };

  const isPremium = useMemo(async () => {
    if (!user?.id) {
      return false;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("pro")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log("error", error);
      ToastAndroid.show(
        "Error sending message in Check Premium",
        ToastAndroid.SHORT
      );
      return false;
    }
    //if pro is true then return true else return false
    if (data?.pro === true) {
      return true;
    } else {
      return false;
    }
  }, [user?.id]);

  const sendMessage = async () => {
    // Disable button to prevent multiple clicks while sending message
    setButtondisabled(true);

    // If inputText is empty, show error message and enable button again
    if (inputText === "") {
      ToastAndroid.show("Please enter a message", ToastAndroid.SHORT);
      setButtondisabled(false);
      return;
    }

    // If inputText is "clear", clear messages and inputText and enable button again
    if (inputText === "clear") {
      setMessages([]);
      setInputText("");
      setButtondisabled(false);
      return;
    }

    // Add user's message to the messages array and scrollToBottom
    setMessages([...messages, { message: inputText, sender: "user" }]);
    setInputText("");
    scrollToBottom();
    setIsTyping(true);

    try {
      // Wait for both isPremium and CheckMe to resolve
      const [isPremiumResult, howManyResult] = await Promise.all([
        isPremium,
        CheckMe(),
      ]);

      // If user is not premium and has sent more than 10 messages, show upgrade message and return
      if (!isPremiumResult) {
        if (typeof howManyResult === "undefined" || howManyResult > 10) {
          ToastAndroid.show(
            "You have reached the limit of 10 messages. Please upgrade to premium to continue",
            ToastAndroid.SHORT
          );
          return;
        }
      }

      // Insert user's message into supabase table
      const { data, error } = await supabase.from("messages").insert([
        {
          message: inputText,
          sender: "user",
          userid: user.id,
          aichatid: 1,
          created_at: new Date(),
        },
      ]);

      // If there was an error inserting the message, show error message and return
      if (error) {
        console.log("error", error);
        ToastAndroid.show("Error sending message", ToastAndroid.SHORT);
        return;
      }

      // Clear inputText and scrollToBottom
      scrollToBottom();

      // Get AI response for user's message
      await getAIResponse(inputText);
    } catch (error) {
      console.log("error", error);
      ToastAndroid.show("Error sending message", ToastAndroid.SHORT);
    } finally {
      // Enable button again after everything is done
      setButtondisabled(false);
    }
  };

  const getAIResponse = useCallback(async (message: string) => {
    try {
      const response = await fetch(
        "https://justchatsapi.justideas.tech/api/openapi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            userid: user?.id,
          }),
        }
      );
      const json = await response.json();

      //remove only first new lines dont remove all
      const aitext = json["text"];
      console.log("aitext", inputText);
      const { error } = await supabase.from("messages").insert([
        {
          message: aitext,
          sender: "ai",
          userid: user?.id,
          aichatid: 1,
          created_at: new Date(),
        },
      ]);
      if (error) {
        console.log("error", error);
        Alert.alert("Error", error.message);
        return;
      }
      setMessages((messages: any) => [
        ...messages,
        { message: aitext, sender: "ai" },
      ]);
      scrollToBottom();
    } catch (error: any) {
      console.log("error", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsTyping(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={scrollToBottom}
        style={styles.messagesContainer}
      >
        {messages.map((message: any, index: number) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.sender === "user" ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text style={styles.messageSender}>{message.sender}</Text>
            <TouchableOpacity
              onPress={() => handleCopy(message.message)}
              style={styles.messageTextContainer}
            >
              <Text style={styles.copytoclip}>Copy</Text>
            </TouchableOpacity>
            <Text key={index} style={styles.messageText}>
              {message.message}
            </Text>
          </View>
        ))}
        <View style={styles.spacer} />
        <View style={styles.istyping}>
          {isTyping ? (
            <Text style={styles.typingtext}>AI is typing...</Text>
          ) : null}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={(text) => setInputText(text)}
          placeholder="Type your message here"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={buttondisabled}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AIChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  messageContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  robotMessage: {
    backgroundColor: "#fff",
    color: "#000",
    marginRight: 10,
    padding: 10,
    borderRadius: 10,
  },
  messageText: {
    color: "#333",
    fontSize: 14,
    textAlign: "left",
  },
  footer: {
    backgroundColor: "#7B68EE",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    alignItems: "center",
    marginRight: 10,
    height: 60,
    fontSize: 16,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: "#000",
    borderRadius: 20,
    padding: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  aiMessage: {
    backgroundColor: "#dcf8c5",
    color: "#fff",
    marginLeft: 10,
    padding: 10,
    borderRadius: 10,
    fontFamily: "Roboto",
  },
  userMessage: {
    backgroundColor: "#ffebcd",
    color: "#000",
    marginRight: 10,
    padding: 10,
    borderRadius: 10,
  },
  messageSender: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 5,
  },
  spacer: {
    height: 20,
  },
  messageTextContainer: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  copytoclip: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 5,
  },
  istyping: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 10,
  },
  typingtext: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
});
