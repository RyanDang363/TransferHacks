import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";

import Colors from "@/constants/Colors";
import { AuthProvider, useAuth } from "@/context/AuthContext";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { user, loading, hasProfile } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";
    const inSurvey = segments[0] === "(survey)";

    if (!user && !inAuth) {
      router.replace("/(auth)/login");
    } else if (user && !hasProfile && !inSurvey) {
      router.replace("/(survey)/allergies");
    } else if (user && hasProfile && (inAuth || inSurvey)) {
      router.replace("/(tabs)");
    }
  }, [user, loading, hasProfile, segments]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const TritonTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.navy,
    border: Colors.light.border,
    primary: Colors.gold,
    notification: Colors.gold,
  },
};

function RootLayoutNav() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={splashStyles.container}>
        <Image
          source={require("../assets/images/logo.png")}
          style={splashStyles.logo}
        />
        <Text style={splashStyles.title}>TritonEats</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={TritonTheme}>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(survey)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="recommend"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Your Picks",
            headerStyle: { backgroundColor: Colors.navy },
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "700", fontSize: 18 },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.navy,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
});
