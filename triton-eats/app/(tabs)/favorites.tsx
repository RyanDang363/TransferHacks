import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Colors from "@/constants/Colors";

interface Favorite {
  id: number;
  food_name: string;
  dining_hall: string;
  station: string;
  calories: number | null;
  protein_g: number | null;
  total_carbs_g: number | null;
  total_fat_g: number | null;
  price: string | null;
  reason: string;
  saved_at: string;
}

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setLoading(true);
      supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false })
        .then(({ data }) => {
          setFavorites(data || []);
          setLoading(false);
        });
    }, [user])
  );

  const handleRemove = (id: number) => {
    Alert.alert("Remove Favorite", "Remove this item from your saved picks?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await supabase.from("favorites").delete().eq("id", id);
          setFavorites((prev) => prev.filter((f) => f.id !== id));
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.center}>
        <FontAwesome name="heart-o" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.emptyTitle}>No saved picks yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the heart on any recommendation to save it here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.count}>{favorites.length} saved pick{favorites.length !== 1 ? "s" : ""}</Text>

      {favorites.map((fav) => (
        <View key={fav.id} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.titleBlock}>
              <Text style={styles.foodName} numberOfLines={2}>{fav.food_name}</Text>
              <View style={styles.locationRow}>
                <FontAwesome name="map-marker" size={12} color={Colors.light.textTertiary} />
                <Text style={styles.location}>
                  {fav.dining_hall}{fav.station ? ` · ${fav.station}` : ""}
                </Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.heartButton, pressed && { opacity: 0.6 }]}
              onPress={() => handleRemove(fav.id)}
            >
              <FontAwesome name="heart" size={18} color="#EF4444" />
            </Pressable>
          </View>

          {(fav.calories != null || fav.protein_g != null) && (
            <View style={styles.macros}>
              {fav.calories != null && (
                <View style={styles.macroPill}>
                  <Text style={[styles.macroValue, { color: Colors.gold }]}>{fav.calories}</Text>
                  <Text style={styles.macroLabel}>Cal</Text>
                </View>
              )}
              {fav.protein_g != null && (
                <View style={styles.macroPill}>
                  <Text style={styles.macroValue}>{Math.round(fav.protein_g)}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
              )}
              {fav.total_carbs_g != null && (
                <View style={styles.macroPill}>
                  <Text style={styles.macroValue}>{Math.round(fav.total_carbs_g)}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
              )}
              {fav.total_fat_g != null && (
                <View style={styles.macroPill}>
                  <Text style={styles.macroValue}>{Math.round(fav.total_fat_g)}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              )}
            </View>
          )}

          {fav.reason ? (
            <View style={styles.reasonRow}>
              <FontAwesome name="lightbulb-o" size={13} color={Colors.gold} />
              <Text style={styles.reason}>{fav.reason}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16, paddingBottom: 100 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: Colors.light.background,
  },
  loadingText: { fontSize: 15, color: Colors.light.textSecondary, marginTop: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.navy, marginTop: 16 },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  count: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  titleBlock: { flex: 1 },
  foodName: { fontSize: 17, fontWeight: "700", color: Colors.navy, lineHeight: 22 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  location: { fontSize: 13, color: Colors.light.textSecondary },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.input,
    alignItems: "center",
    justifyContent: "center",
  },
  macros: { flexDirection: "row", gap: 6, marginBottom: 10 },
  macroPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.input,
  },
  macroValue: { fontSize: 15, fontWeight: "700", color: Colors.navy },
  macroLabel: { fontSize: 10, color: Colors.light.textSecondary, marginTop: 2, fontWeight: "600" },
  reasonRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  reason: { flex: 1, fontSize: 13, color: Colors.light.textSecondary, lineHeight: 19 },
});
