import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@/context/AuthContext";
import { FoodRecommendation, getRecommendations } from "@/lib/api";
import Colors from "@/constants/Colors";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFindFood = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location needed",
          "We need your location to find the closest dining options. Please enable location in Settings."
        );
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const recs = await getRecommendations(
        user.id,
        loc.coords.latitude,
        loc.coords.longitude
      );

      router.push({
        pathname: "/recommend",
        params: {
          data: JSON.stringify(recs),
          userLat: String(loc.coords.latitude),
          userLng: String(loc.coords.longitude),
        },
      });
    } catch (e: any) {
      Alert.alert("Error", e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.greeting}>What's good, Triton?</Text>
        <Text style={styles.tagline}>
          Tap below to get personalized food picks near you
        </Text>
      </View>

      <View style={styles.body}>
        <Pressable
          style={({ pressed }) => [
            styles.findButton,
            loading && styles.findButtonDisabled,
            pressed && !loading && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleFindFood}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.findButtonText}>Finding your picks...</Text>
            </View>
          ) : (
            <View style={styles.buttonInner}>
              <FontAwesome name="location-arrow" size={20} color="#FFFFFF" />
              <Text style={styles.findButtonText}>Find Food Near Me</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.featureRow}>
          <View style={styles.featurePill}>
            <Text style={styles.featureText}>AI-ranked</Text>
          </View>
          <View style={styles.featureDot} />
          <View style={styles.featurePill}>
            <Text style={styles.featureText}>Walk times</Text>
          </View>
          <View style={styles.featureDot} />
          <View style={styles.featurePill}>
            <Text style={styles.featureText}>8 dining halls</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  heroCard: {
    backgroundColor: Colors.navy,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    paddingTop: 0,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logo: { width: 180, height: 180, resizeMode: "contain", marginBottom: -40 },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 20,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  findButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  findButtonDisabled: { opacity: 0.7 },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  findButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },
  featurePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  featureText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.textTertiary,
  },
});
