import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";

const DIETS = [
  { id: "halal", label: "Halal", icon: "☪️" },
  { id: "kosher", label: "Kosher", icon: "✡️" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { id: "gluten-free", label: "Gluten Free", icon: "🚫" },
];

export default function DietScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ allergies: string }>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customText, setCustomText] = useState("");

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNext = () => {
    const all = [...selected];
    if (customText.trim()) {
      customText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => all.push(s));
    }
    router.push({
      pathname: "/(survey)/fitness",
      params: {
        allergies: params.allergies || "[]",
        diet_restrictions: JSON.stringify(all),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Dietary restrictions?</Text>
        <Text style={styles.subheading}>
          Based on your beliefs, lifestyle, whatever works for you
        </Text>

        <View style={styles.list}>
          {DIETS.map((item) => {
            const active = selected.has(item.id);
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.row,
                  active && styles.rowActive,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => toggle(item.id)}
              >
                <Text style={styles.rowIcon}>{item.icon}</Text>
                <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                  {item.label}
                </Text>
                {active && (
                  <FontAwesome name="check-circle" size={20} color={Colors.gold} />
                )}
              </Pressable>
            );
          })}

          <View style={styles.otherSection}>
            <Text style={styles.otherLabel}>Other</Text>
            <TextInput
              style={styles.otherInput}
              placeholder="e.g. pescatarian, low-sodium, keto"
              placeholderTextColor={Colors.light.textTertiary}
              value={customText}
              onChangeText={setCustomText}
              autoCapitalize="none"
            />
            <Text style={styles.otherHint}>Separate multiple with commas</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
          <FontAwesome name="arrow-right" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { padding: 20, paddingBottom: 120 },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.navy,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.light.card,
    gap: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rowActive: {
    backgroundColor: Colors.navy,
  },
  rowIcon: { fontSize: 22, width: 30, textAlign: "center" },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: "600", color: Colors.light.text },
  rowLabelActive: { color: "#FFFFFF" },
  otherSection: {
    marginTop: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  otherLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.navy,
    marginBottom: 8,
  },
  otherInput: {
    backgroundColor: Colors.light.input,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  otherHint: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    marginTop: 6,
  },
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
    backgroundColor: Colors.navy,
    borderRadius: 14,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
