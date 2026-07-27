// app/login.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signIn } from "../src/lib/auth";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#0b6e4f",
  primaryLight: "#dff2e6",
  bg: "#f6f7f6",
  card: "#ffffff",
  border: "rgba(0,0,0,0.08)",
  text: "#1a2e35",
  textSecondary: "#6c757d",
  danger: "#EF4444",
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      const user = await signIn(email, password);

      if (user && user.email) {
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Erreur", "Email ou mot de passe incorrect");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Erreur", "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Header image */}
        <View style={styles.imageHeader}>
          <Image
            source={require("../assets/images/bav.png")}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.contentCard}>
          {/* Logo */}
          <View style={styles.logoPill}>
            <Text style={styles.logoText}>🌿 MicroVita</Text>
          </View>

          <Text style={styles.subtitle}>Connexion</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={COLORS.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />

                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mot de passe"
                  placeholderTextColor={COLORS.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Login button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    Se connecter
                  </Text>
                )}
              </TouchableOpacity>

              {/* Forgot password */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => router.push("/request-reset")}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>

              {/* Register */}
              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => router.push("/register")}
              >
                <Text style={styles.registerText}>
                  Pas encore de compte ?{" "}
                  <Text style={styles.registerBold}>
                    S'inscrire
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <Text style={styles.footer}>
            © 2026 MicroVita • Tous droits réservés
          </Text>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  imageHeader: {
    height: height * 0.45,
    width: "100%",
  },

  headerImage: {
    width: "100%",
    height: "100%",
  },

  contentCard: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: 40,
    paddingBottom: 16,
    alignItems: "center",
    position: "relative",
  },

  logoPill: {
    position: "absolute",
    top: -15,
    alignSelf: "center",
    backgroundColor: COLORS.card,
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
    fontSize: width * 0.045,
  },

  subtitle: {
    fontSize: width * 0.08,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  form: {
    gap: height * 0.02,
    width: "100%",
    alignItems: "center",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: width * 0.03,
    paddingHorizontal: width * 0.04,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: width * 0.03,

    width: width * 0.65,
    alignSelf: "center",
  },

  input: {
    flex: 1,
    paddingVertical: height * 0.018,
    fontSize: width * 0.04,
    color: COLORS.text,
  },

  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: width * 0.03,
    paddingVertical: height * 0.016,
    alignItems: "center",
    marginTop: height * 0.02,

    width: width * 0.65,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: "#fff",
    fontSize: width * 0.04,
    fontWeight: "600",
  },

  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: height * 0.01,
  },

  forgotPasswordText: {
    fontSize: width * 0.032,
    color: COLORS.primary,
    fontWeight: "500",
  },

  registerLink: {
    alignItems: "center",
    marginTop: height * 0.01,
  },

  registerText: {
    fontSize: width * 0.035,
    color: COLORS.textSecondary,
  },

  registerBold: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  footer: {
    marginTop: "auto",
    color: "#9ca3af",
    fontSize: width * 0.03,
    fontWeight: "600",
    paddingBottom: 10,
    textAlign: "center",
  },
});