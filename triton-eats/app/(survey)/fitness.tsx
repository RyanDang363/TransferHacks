import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Colors from "@/constants/Colors";

const GOALS = [
  { id: "cut", label: "Cutting", desc: "High protein, lower cals — lean mode", icon: "🔥" },
  { id: "bulk", label: "Bulking", desc: "Max cals and protein — gains mode", icon: "💪" },
  { id: "maintain", label: "Maintaining", desc: "Balanced macros — stay consistent", icon: "⚖️" },
];

export default function FitnessScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const params = useLocalSearchParams<{ allergies: string; diet_restrictions: string }>();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!selected) {
      Alert.alert("Pick a goal", "Select your current fitness goal to continue.");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const allergies = JSON.parse(params.allergies || "[]");
      const dietRestrictions = JSON.parse(params.diet_restrictions || "[]");

      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        fitness_goal: selected,
        allergies,
        diet_restrictions: dietRestrictions,
      });

      if (error) throw error;

      await refreshProfile();
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>What's the goal?</Text>
        <Text style={styles.subheading}>
          We'll match food recs to your fitness vibe
        </Text>

        <View style={styles.options}>
          {GOALS.map((goal) => {
            const active = selected === goal.id;
            return (
              <Pressable
                key={goal.id}
                style={({ pressed }) => [
                  styles.card,
                  active && styles.cardActive,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => setSelected(goal.id)}
              >
                <Text style={styles.cardIcon}>{goal.icon}</Text>
                <View style={styles.cardText}>
                  <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>
                    {goal.label}
                  </Text>
                  <Text style={[styles.cardDesc, active && styles.cardDescActive]}>
                    {goal.desc}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            loading && styles.buttonDisabled,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleFinish}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Let's go"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { padding: 24, paddingBottom: 140 },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.navy,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 28,
  },
  options: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    gap: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardActive: {
    backgroundColor: Colors.navy,
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardIcon: { fontSize: 36 },
  cardText: { flex: 1 },
  cardLabel: { fontSize: 18, fontWeight: "700", color: Colors.navy },
  cardLabelActive: { color: "#FFFFFF" },
  cardDesc: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 3 },
  cardDescActive: { color: "rgba(255,255,255,0.6)" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Colors.light.background,
  },
  button: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
});
