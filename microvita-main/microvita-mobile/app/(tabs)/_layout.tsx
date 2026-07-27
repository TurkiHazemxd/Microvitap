
// imports
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Pressable,
} from "react-native";
import { isSignedIn, getUser } from "../../src/lib/auth";
import { isGuestMode } from "../../src/services/guest";


// les dimensions

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#0b6e4f",
  bg: "#f6f7f6",
  card: "#ffffff",
  border: "rgba(0,0,0,0.08)",
  text: "#1a2e35",
  textSecondary: "#6c757d",
  danger: "#EF4444",
};
// main tabs component
export default function TabsLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showProfileIcon, setShowProfileIcon] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [menuVisible, setMenuVisible] = useState(false);

  // auth check and user setup
  // verifies if user is signed in, redirects to welcome if not.
  // fetches user role and checks guest mode to conditionally hide profile icon.
  // guest users don't get a profile icon.
  useEffect(() => {
    (async () => {
      const ok = await isSignedIn();
      if (!ok) {
        router.replace("/welcome");
        setChecking(false);
        return;
      }
      
      // get user role
      const user = await getUser();
      console.log("User in layout:", user);
      if (user && user.role) {
        setUserRole(user.role);
      }
      
      // check if user is in guest mode - hide profile icon for guests
      const isGuest = await isGuestMode();
      setShowProfileIcon(!isGuest);
      
      setChecking(false);
    })();
  }, [router]);

  const isAdmin = userRole === "admin";

  // 
  // admin menu modal
  // ============================================
  // popup menu for admin users to switch between Recommendations and Admin panel.
  // triggered by pressing the "More" tab button.
  const AdminMenuModal = () => (
    <Modal
      visible={menuVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity onPress={() => setMenuVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              router.push("/(tabs)/recommendations");
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
            <Text style={styles.menuItemText}>Recommendations</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              router.push("/(tabs)/admin");
            }}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.danger} />
            <Text style={styles.menuItemText}>Administration</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );


  // LOADING STATE
  
  // shows spinner while checking authentication status
  if (checking) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  // tab navigator render
  return (
    <>
      <AdminMenuModal />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.card,
            shadowColor: "transparent",
            elevation: 0,
          },
          headerTitleStyle: {
            fontSize: width * 0.045,
            fontWeight: "600",
            color: COLORS.text,
            textAlign: "center",
          },
          headerTitleAlign: "center",
          tabBarStyle: {
            backgroundColor: COLORS.card,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: height * 0.09,
            paddingBottom: height * 0.02,
            paddingTop: height * 0.01,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarLabelStyle: {
            fontSize: width * 0.03,
            fontWeight: "500",
          },
        }}
      >
        
        {/* Shows profile icon in header for non-guest users */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Accueil",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
            headerRight: showProfileIcon ? () => (
              <TouchableOpacity
                onPress={() => router.push("/Profile")}
                style={styles.profileButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={34}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            ) : undefined,
          }}
        />

        {/* ========== MICROGREENS TAB ========== */}
        <Tabs.Screen
          name="microgreens"
          options={{
            title: "Microgreens",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf-outline" size={size} color={color} />
            ),
          }}
        />

        {/* ========== RECIPES TAB ========== */}
        <Tabs.Screen
          name="recipes"
          options={{
            title: "Recettes",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="restaurant-outline" size={size} color={color} />
            ),
          }}
        />

        {/* ========== DISTRIBUTION TAB ========== */}
        <Tabs.Screen
          name="distr"
          options={{
            title: "Distribution",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="storefront-outline" size={size} color={color} />
            ),
          }}
        />

        {/* ========== RECOMMENDATIONS / MORE TAB ========== */}
        {/* For admin: shows menu button that opens modal with two options */}
        {/* For non-admin: shows normal recommendations tab */}
        {isAdmin ? (
          <Tabs.Screen
            name="recommendations"
            options={{
              title: "More",
              tabBarIcon: ({ color, size }) => (
                <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
                  <Ionicons name="menu-outline" size={size} color={color} />
                </TouchableOpacity>
              ),
              tabBarButton: (props) => (
                <TouchableOpacity
                  {...props}
                  onPress={() => setMenuVisible(true)}
                  activeOpacity={0.7}
                  style={[props.style, styles.menuTabButton]}
                />
              ),
            }}
          />
        ) : (
          <Tabs.Screen
            name="recommendations"
            options={{
              title: "Recommendations",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
              ),
              headerTitleAlign: "left",
            }}
          />
        )}

        {/* ========== HIDDEN TABS ========== */}
        {/* These screens exist but don't appear in bottom tab bar */}
        <Tabs.Screen name="Profile" options={{ href: null }} />
        <Tabs.Screen name="admin" options={{ href: null }} />
        <Tabs.Screen name="chat" options={{ href: null }} />
         
        
      </Tabs>
    </>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  profileButton: {
    marginRight: width * 0.04,
    padding: width * 0.01,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    marginHorizontal: 0,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  menuTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});