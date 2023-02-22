import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, View } from "../components/Themed";
import { supabase } from "../config/supabase";
import { RootTabScreenProps } from "../types";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages]: any = useState([]);
  const [aichats, setAichats]: any = useState([]);
  const [newChat, setNewChat] = useState("");

  useEffect(() => {
    //get user from supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });
  }, []);

  useEffect(() => {
    //get all chats from supabase
    const getData = async () => {
      if (!user) {
        return;
      }

      const { data, error } = await supabase
        .from("aichats")
        .select("*")
        .order("created_at", { ascending: true })
        .eq("userid", user.id);
      if (error) {
        console.log("error", error);
        Alert.alert("Error", error.message);
      } else {
        // Format the created_at value for each item
        const formattedData = data.map((item: any) => {
          const date = new Date(item.created_at);
          const time = date.toLocaleTimeString();
          const dateStr = date.toLocaleDateString();
          const createdAt = dateStr + " " + time;
          return {
            ...item,
            created_at: createdAt,
          };
        });
        setAichats(formattedData);
      }
    };
    getData();
  }, [user]);

  if (user) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scroll}>
          {aichats &&
            aichats.length > 0 &&
            aichats.map((aichat: any, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate("AIChatScreen")}
              >
                <View style={styles.infoContainer}>
                  <Image
                    style={styles.avatar}
                    source={{
                      uri: "https://freesvg.org/img/1538298822.png",
                    }}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>{aichat?.name}</Text>
                    <Text style={styles.infoSubtitle}>
                      {aichat?.created_at}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    );
  }
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
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
    borderRadius: 10,
    marginLeft: 20,
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
});
