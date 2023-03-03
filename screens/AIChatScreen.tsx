import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../config/supabase";
import * as Clipboard from "expo-clipboard";

const AIChatScreen = () => {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages]: any = useState([]);
  const flatListRef = useRef<any>();
  const [user, setUser] = useState<any>(null);
  const [pageSize, setPageSize] = useState(10);
  const [buttoniddisabled, setButtoniddisabled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("user_message, ai_message")
          .eq("userid", user?.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        const message = data.flatMap((message: any) => [
          {
            message: message.ai_message,
            sender: "ai",
          },
          {
            message: message.user_message,
            sender: "user",
          },
        ]);

        setMessages(message.reverse());
      } catch (error) {
        console.log("error", error);
      }
    };

    //wait for user to be set
    if (user) {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    Scrolling();
  }, [messages]);

  const Scrolling = () => {
    if (messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleCopy = useCallback(async (message: any) => {
    const clipboardtext: string = message.toString();
    try {
      await Clipboard.setStringAsync(clipboardtext);
      ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
    } catch (error: any) {
      console.log("error", error);
      ToastAndroid.show("Error copying to clipboard", ToastAndroid.SHORT);
    }
  }, []);

  const sendMessage = () => {
    setButtoniddisabled(true);
    if (inputText.trim() === "") {
      ToastAndroid.show("Please enter a message", ToastAndroid.SHORT);
      setButtoniddisabled(false);
      return;
    }
    setMessages([...messages, { message: inputText, sender: "user" }]);
    setInputText("");
    sendBotResponse(inputText);
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const CheckMePremium = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("pro")
      .eq("id", user?.id)
      .single();
    if (error) throw error;
    if (data.pro === true) {
      return true;
    } else {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("userid", user.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (data.length > 10) {
        return true;
      } else {
        ToastAndroid.show(
          "You need to be a premium member to use this feature",
          ToastAndroid.SHORT
        );
        return false;
      }
    }
  };

  const getAIResponse = async (userMessage: any) => {
    const check = await CheckMePremium();
    if (check === false) {
      return;
    }

    // replace this with your AI service that provides a response
    try {
      const response = await fetch(
        "https://justchatsapi.justideas.tech/api/openapi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            userid: user?.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const aitext = data["text"];

      return aitext;
    } catch (error) {
      console.log(error);
      return "Sorry, I am having some trouble. Please try again later.";
    }
  };

  const storeAIResponse = async (userMessage: any, botMessage: any) => {
    // store the user message and the bot response in the database supabase
    try {
      const { data, error } = await supabase.from("messages").insert([
        {
          userid: user?.id,
          user_message: userMessage,
          ai_message: botMessage,
          aichatid: 1,
          created_at: new Date(),
        },
      ]);
      if (error) throw error;
    } catch (error) {
      console.log("error", error);
    }
  };

  const sendBotResponse = async (userMessage: any) => {
    try {
      setMessages([...messages, { message: "Typing...", sender: "AI" }]);

      Scrolling();

      // Call the API to get the bot's response
      const botMessage = await getAIResponse(userMessage);

      // Update the messages list with the user message and bot response call fetchMessages
      setMessages([
        ...messages,
        { message: userMessage, sender: "user" },
        { message: botMessage, sender: "ai" },
      ]);
      setButtoniddisabled(false);

      // Store the user message and bot response in the database
      storeAIResponse(userMessage, botMessage);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMoreMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("user_message, ai_message, created_at")
        .eq("aichatid", 1)
        .order("created_at", { ascending: false })
        .range(messages.length, messages.length + pageSize - 1);

      if (error) throw error;

      const newMessages = data.flatMap((message: any) => [
        { message: message.ai_message, sender: "ai", time: message.created_at },
        {
          message: message.user_message,
          sender: "user",
          time: message.created_at,
        },
      ]);

      setMessages((prevMessages: any) => [
        ...newMessages.reverse(),
        ...prevMessages,
      ]);
    } catch (error) {
      console.log("Error loading more messages:", error);
      ToastAndroid.show("Error loading more messages", ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={loadMoreMessages}>
        <Text style={styles.loadMore}>Load More</Text>
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCopy(item.message)}>
            <View
              style={[
                item.sender === "user" ? styles.userMessage : styles.aiMessage,
                item.isTyping && styles.typing,
              ]}
            >
              <Text>{item.message}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messagesContainer}
        // inverted // show the latest message at the bottom
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
          placeholder="Ask Your Questions to AI..."
          onKeyPress={handleKeyPress}
        />
        <Button
          title="Send"
          onPress={sendMessage}
          color="#000"
          disabled={buttoniddisabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  messagesContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#ffe4c4",
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 7,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  userMessage: {
    backgroundColor: "#eee",
    alignSelf: "flex-end",
    padding: 10,
    margin: 5,
    marginRight: 50,
    maxWidth: "95%",
    borderRadius: 10,
  },
  aiMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    padding: 10,
    margin: 5,
    marginLeft: 50,
    maxWidth: "95%",
    borderRadius: 10,
  },
  typing: {
    backgroundColor: "#eee",
  },
  loadMore: {
    color: "#0000ff",
    alignSelf: "center",
    padding: 10,
  },
  loadMoreMessages: {
    color: "#0000ff",
    alignSelf: "center",
    padding: 10,
  },
  code: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
    padding: 10,
    margin: 5,
    marginLeft: 50,
    maxWidth: "95%",
    borderRadius: 10,
    color: "#000",
  },
});

export default AIChatScreen;
