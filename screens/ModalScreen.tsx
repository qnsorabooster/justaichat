import { useStripe } from "@stripe/stripe-react-native";
import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from "react-native";
import { Text } from "../components/Themed";
import { supabase } from "../config/supabase";

const API_URL = "https://justchatsapi.justideas.tech/api";

export default function ModalScreen() {
  const [selectedOption, setSelectedOption]: any = useState(null);
  const [user, setUser]: any = useState(null);
  const subscriptionOptions = [
    {
      id: 1,
      name: "Weekly",
      price: "$7/week",
      description: "Access to basic features",
      tagline: "Try it out for a week",
    },
    {
      id: 2,
      name: "Monthly",
      price: "$25/month",
      description: "Access to basic features",
      tagline: "Get more for less",
    },
    {
      id: 3,
      name: "Yearly",
      price: "$300/year",
      description: "Access to premium features",
      tagline: "Unlock all premium features",
      discount: "Save 50%",
    },
  ];
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleSelectOption = (option: any) => {
    setSelectedOption(option);
  };

  const getUser = async () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });
  };

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${API_URL}/payment-sheet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: selectedOption.id
          ? selectedOption.id === 1
            ? 7
            : selectedOption.id === 2
            ? 25
            : 300
          : 0,
      }),
    });
    const { clientSecret, ephemeralKey, customer, publishableKey } =
      await response.json();

    return {
      paymentIntent: clientSecret,
      ephemeralKey,
      customer,
      publishableKey,
    };
  };

  const initializePaymentSheet = async () => {
    const { paymentIntent, ephemeralKey, customer, publishableKey } =
      await fetchPaymentSheetParams();

    console.log(paymentIntent, ephemeralKey, customer, publishableKey);

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Justideas",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      // Set `requiredBillingAddressFields` to `full` if you need to collect a full billing
      defaultBillingDetails: {
        email: user?.email,
      },
    });
    if (!error) {
      console.log("Initialized");
    }
  };

  const handleSubscribe = async () => {
    // initializePaymentSheet();
    if (!selectedOption) {
      Alert.alert("Please select a subscription plan");
      return;
    }
    console.log(selectedOption.id);
    await initializePaymentSheet();

    await new Promise((resolve) => setTimeout(resolve, 2500));
    // TODO: Implement subscription functionality
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert("Success", "Your order is confirmed!");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>
          Unlock the full potential of JustAIChat
        </Text>
        <View style={styles.cardContainer}>
          {subscriptionOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.card,
                selectedOption?.id === option.id && styles.selectedCard,
              ]}
              onPress={() => handleSelectOption(option)}
            >
              <Text style={styles.cardTitle}>{option.name}</Text>
              {option.discount && (
                <Text style={styles.cardDiscount}>{option.discount}</Text>
              )}
              <Text style={styles.cardPrice}>{option.price}</Text>
              <Text style={styles.cardDescription}>{option.description}</Text>
              <Text style={styles.cardTagline}>{option.tagline}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>Subscribe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffefd5",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    fontFamily: "Roboto",
    color: "#444",
  },
  cardContainer: {
    flex: 1,
    width: "100%",
    marginTop: 20,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    flexWrap: "wrap",
    flexDirection: "row",
    backgroundColor: "#ffefd5",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    marginBottom: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  selectedCard: {
    borderColor: "red",
    borderWidth: 2,
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  cardDiscount: {
    color: "red",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 10,
  },
  cardPrice: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  cardDescription: {
    fontSize: 16,
    color: "#555",
    textAlign: "left",
    fontFamily: "Roboto",
    marginTop: 5,
    lineHeight: 24,
  },
  cardTagline: {
    fontSize: 12,
    color: "#aaa",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subscribeButton: {
    backgroundColor: "red",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  subscribeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontSize: 22,
  },
});
