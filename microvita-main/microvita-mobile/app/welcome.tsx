// app/welcome.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { enableGuestMode } from "../src/services/guest";

const COLORS = {
  bg: "#e2f3e5",
  primary: "#008000",
  headline: "#1a4d2e",
  sub: "#4f6f52",
  white: "#ffffff",
  muted: "#6b7280",
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// Responsive helpers
const H_PADDING = Math.min(30, SCREEN_W * 0.08);
const scale = SCREEN_W / 375;
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(n, max));

export default function Welcome() {
  const router = useRouter();

  const handleGuestAccess = async () => {
    try {
      await enableGuestMode();
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error enabling guest mode:", error);
      Alert.alert("Erreur", "Impossible d'accéder en mode invité");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        {/* Image header */}
        <View style={styles.imageHeader}>
          <Image
            source={require("../assets/images/bav.png")}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        {/* card content */}
        <View style={styles.contentCard}>
          {/* logo */}
          <View style={styles.logoPill}>
            <Text style={styles.logoText}>🌿 MicroVita</Text>
          </View>

          <Text style={styles.headline}>Grow Small. Live Big</Text>

          <Text style={styles.subheadline}>
            Fresh, nutrient-dense greens delivered to your door or grown on your
            sill.
          </Text>

          { /* les buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.btnPrimaryText}>SE CONNECTER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.btnSecondaryText}>CREER UN COMPTE</Text>
            </TouchableOpacity>
          </View>

          {/* invité mode */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.guestButton}
            onPress={handleGuestAccess}
          >
            <Text style={styles.guestButtonText}>Continuer sans compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGuestAccess}
          >
            
          </TouchableOpacity>

          {/* divider */}
          <View style={styles.divider} />

          {/* footer */}
          <Text style={styles.footer}>
            © 2026 MicroVita • Tous droits réservés
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f0f0f0" },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  imageHeader: {
    height: SCREEN_H * 0.45,
    width: "100%",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  contentCard: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: 40,
    paddingBottom: 16,
    alignItems: "center",
    position: "relative",
  },
  link: {
    textAlign: "center",
    marginTop: 10,
    color: COLORS.muted,
    fontSize: clamp(12 * scale, 11, 13),
    fontWeight: "600",
  },
  guestButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  guestButtonText: {
    color: COLORS.primary,
    fontSize: clamp(13 * scale, 12, 14),
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  logoPill: {
    position: "absolute",
    top: -15,
    alignSelf: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  logoText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: clamp(16 * scale, 14, 18),
  },
  headline: {
    color: COLORS.headline,
    fontSize: clamp(32 * scale, 26, 36),
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  subheadline: {
    color: COLORS.sub,
    fontSize: clamp(15 * scale, 13, 16),
    lineHeight: clamp(20 * scale, 18, 22),
    textAlign: "center",
    marginBottom: 34,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  btn: {
    width: "100%",
    maxWidth: 320,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: clamp(14 * scale, 13, 15),
    letterSpacing: 0.4,
  },
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  btnSecondaryText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: clamp(14 * scale, 13, 15),
    letterSpacing: 0.4,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.12)",
    marginTop: 28,
    marginBottom: 10,
  },
  footer: {
    marginTop: "auto",
    color: "#9ca3af",
    fontSize: clamp(11 * scale, 10, 12),
    fontWeight: "600",
    paddingBottom: 20,
    textAlign: "center",
  },
});