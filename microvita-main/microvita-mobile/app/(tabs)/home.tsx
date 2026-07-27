import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  primary: "#2A5C4A",
  primaryLight: "#E8F3EF",
  primaryDark: "#1D4033",
  secondary: "#F4A261",
  accent: "#E76F51",
  background: "#F9F7F4",
  surface: "#FFFFFF",
  text: "#2C3E2F",
  textSecondary: "#5D6F64",
  textTertiary: "#8B9A8E",
  border: "#E5E9E6",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#4A7856",
  warning: "#F4A261",
  error: "#E76F51",
  info: "#6B9080",
  mint: "#D4E6D9",
  sand: "#F1E9DB",
  terracotta: "#E6B8A2",
  gold: "#D4A373",
  gradientStart: "#1248ac",
  gradientEnd: "#1769b1",
};

const { width: W, height: H } = Dimensions.get("window");
const H_PADDING = 24;

// Types
type Microgreen = {
  id: string;
  name: string;
  scientificName: string;
  benefits: string[];
  image: ImageSourcePropType;
  growingTime: string;
  color: string;
  description: string;
  nutrition: {
    vitaminC?: string;
    iron?: string;
    calcium?: string;
    vitaminK?: string;
    vitaminE?: string;
  };
  season: string;
  difficulty: string;
};

type Recipe = {
  id: string;
  title: string;
  image: ImageSourcePropType;
  time: string;
  difficulty: string;
  calories: string;
  author: string;
  rating: number;
  ingredients: string[];
};

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: ImageSourcePropType;
};

type Category = {
  id: string;
  name: string;
  icon: string;
};

type Partner = {
  id: string;
  name: string;
  type: string;
  icon: string;
  location: string;
};

// Micro-pousses data
const MICROGREENS: Microgreen[] = [
  {
    id: "1",
    name: "Brocoli",
    scientificName: "Brassica oleracea",
    benefits: ["Anti-inflammatoire", "Riche en fer", "Détoxifiant"],
    image: require("../../assets/images/broc.png"),
    growingTime: "7-10 jours",
    color: "#4A7856",
    description:
      "Les micro-pousses de brocoli sont concentrées en sulforaphane, un puissant antioxydant qui aide à prévenir les maladies chroniques.",
    nutrition: {
      vitaminC: "60%",
      iron: "15%",
      calcium: "8%",
      vitaminK: "150%",
    },
    season: "Printemps, Automne",
    difficulty: "Facile",
  },
  {
    id: "2",
    name: "Radis",
    scientificName: "Raphanus sativus",
    benefits: ["Antioxydant", "Digestif", "Vitamine C"],
    image: require("../../assets/images/tes.png"),
    growingTime: "5-7 jours",
    color: "#E76F51",
    description:
      "Les pousses de radis ont une saveur piquante et rafraîchissante. Elles stimulent la digestion et renforcent l'immunité.",
    nutrition: {
      vitaminC: "35%",
      iron: "6%",
      calcium: "5%",
      vitaminK: "15%",
    },
    season: "Toute l'année",
    difficulty: "Facile",
  },
  {
    id: "3",
    name: "Pois",
    scientificName: "Pisum sativum",
    benefits: ["Protéines", "Calcium", "Fer"],
    image: require("../../assets/images/pois.png"),
    growingTime: "8-12 jours",
    color: "#6B9080",
    description:
      "Les micro-pousses de pois ont un goût sucré et une texture croquante. Riches en protéines végétales et en chlorophylle.",
    nutrition: {
      vitaminC: "15%",
      iron: "12%",
      calcium: "7%",
      vitaminK: "25%",
    },
    season: "Printemps, Été",
    difficulty: "Moyen",
  },
  {
    id: "4",
    name: "Tournesol",
    scientificName: "Helianthus annuus",
    benefits: ["Vitamine E", "Zinc", "Protéines"],
    image: require("../../assets/images/tourne.png"),
    growingTime: "8-10 jours",
    color: "#F4A261",
    description:
      "Les pousses de tournesol ont une saveur de noisette. Excellente source de vitamine E, un antioxydant puissant.",
    nutrition: {
      vitaminC: "10%",
      iron: "8%",
      calcium: "6%",
      vitaminE: "45%",
    },
    season: "Été, Automne",
    difficulty: "Facile",
  },
];

// Recettes
const RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Salade de micro-pousses",
    image: require("../../assets/images/tarte.png"),
    time: "15 min",
    difficulty: "Facile",
    calories: "245 kcal",
    author: "Marie",
    rating: 4.8,
    ingredients: ["Roquette", "Radis", "Tournesol", "Citron", "Huile d'olive"],
  },
  {
    id: "2",
    title: "Bol protéiné",
    image: require("../../assets/images/ac.png"),
    time: "20 min",
    difficulty: "Moyen",
    calories: "380 kcal",
    author: "Thomas",
    rating: 4.5,
    ingredients: ["Quinoa", "Pois", "Avocat", "Feta", "Menthe"],
  },
  {
    id: "3",
    title: "Tartine avocat",
    image: require("../../assets/images/ae.png"),
    time: "10 min",
    difficulty: "Facile",
    calories: "280 kcal",
    author: "Sophie",
    rating: 4.9,
    ingredients: ["Pain complet", "Avocat", "Radis", "Citron", "Fleur de sel"],
  },
  {
    id: "4",
    title: "Smoothie vert",
    image: require("../../assets/images/tarte.png"),
    time: "8 min",
    difficulty: "Facile",
    calories: "180 kcal",
    author: "Julie",
    rating: 4.6,
    ingredients: ["Banane", "Épinards", "Pois", "Pomme", "Gingembre"],
  },
  {
    id: "5",
    title: "Tarte à l'avoine",
    image: require("../../assets/images/tarte.png"),
    time: "35 min",
    difficulty: "Moyen",
    calories: "320 kcal",
    author: "Pierre",
    rating: 4.7,
    ingredients: [
      "Flocons d'avoine",
      "Micro-pousses",
      "Œufs",
      "Crème",
      "Fromage",
    ],
  },
];

// Articles de blog
const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "Les bienfaits des micro-pousses",
    excerpt:
      "Découvrez pourquoi les micro-pousses sont considérées comme un super-aliment...",
    author: "Dr. Ben Ali",
    date: "12 Mars 2024",
    category: "Nutrition",
    readTime: "5 min",
    image: require("../../assets/images/broc.png"),
  },
  {
    id: "2",
    title: "Comment cultiver ses micro-pousses",
    excerpt:
      "Guide pratique pour débuter la culture de micro-pousses à la maison...",
    author: "Ferme MicroVita",
    date: "10 Mars 2024",
    category: "Guide",
    readTime: "8 min",
    image: require("../../assets/images/pois.png"),
  },
  {
    id: "3",
    title: "Recettes d'été rafraîchissantes",
    excerpt:
      "3 recettes faciles à base de micro-pousses pour les journées chaudes...",
    author: "Chef Marie",
    date: "8 Mars 2024",
    category: "Recettes",
    readTime: "6 min",
    image: require("../../assets/images/tourne.png"),
  },
];

// Catégories
const CATEGORIES: Category[] = [
  { id: "1", name: "Tous", icon: "apps" },
  { id: "2", name: "Micro-pousses", icon: "leaf" },
  { id: "3", name: "Recettes", icon: "restaurant" },
  { id: "4", name: "Articles", icon: "newspaper" },
  { id: "5", name: "Partenaires", icon: "people" },
];

// Featured Card Component
function FeaturedCard({
  item,
  onPress,
}: {
  item: Microgreen;
  onPress: (item: Microgreen) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <Image source={item.image} style={styles.featuredImage} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.featuredGradient}
      >
        <Text style={styles.featuredTitle}>{item.name}</Text>
        <Text style={styles.featuredSubtitle}>{item.scientificName}</Text>
        <View style={styles.featuredBadge}>
          <Ionicons name="time" size={12} color="#FFFFFF" />
          <Text style={styles.featuredBadgeText}>{item.growingTime}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Recipe Card Component
function RecipeCard({
  item,
  onPress,
}: {
  item: Recipe;
  onPress: (item: Recipe) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <Image source={item.image} style={styles.recipeCardImage} />
      <View style={styles.recipeCardContent}>
        <View style={styles.recipeCardHeader}>
          <Text style={styles.recipeCardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.recipeCardRating}>
            <Ionicons name="star" size={12} color={COLORS.gold} />
            <Text style={styles.recipeCardRatingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.recipeCardMeta}>
          <View style={styles.recipeCardMetaItem}>
            <Ionicons
              name="time-outline"
              size={12}
              color={COLORS.textTertiary}
            />
            <Text style={styles.recipeCardMetaText}>{item.time}</Text>
          </View>
          <View style={styles.recipeCardMetaItem}>
            <Ionicons
              name="flame-outline"
              size={12}
              color={COLORS.textTertiary}
            />
            <Text style={styles.recipeCardMetaText}>{item.calories}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Blog Card Component
function BlogCard({
  item,
  onPress,
}: {
  item: BlogPost;
  onPress: (item: BlogPost) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <Image source={item.image} style={styles.blogCardImage} />
      <View style={styles.blogCardContent}>
        <View style={styles.blogCardCategory}>
          <Text style={styles.blogCardCategoryText}>{item.category}</Text>
        </View>
        <Text style={styles.blogCardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.blogCardFooter}>
          <Text style={styles.blogCardAuthor}>{item.author}</Text>
          <Text style={styles.blogCardDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Partner Card Component
const PARTNERS_DATA: Partner[] = [
  {
    id: "1",
    name: "Restaurant Le Bio",
    type: "Restaurant",
    icon: "restaurant",
    location: "Tunis",
  },
  {
    id: "2",
    name: "Marché Central",
    type: "Point de vente",
    icon: "cart",
    location: "Lac 2",
  },
  {
    id: "3",
    name: "Ferme Bio",
    type: "Fournisseur",
    icon: "leaf",
    location: "Borj Cédria",
  },
  {
    id: "4",
    name: "Bio Express",
    type: "Livraison",
    icon: "bicycle",
    location: "Tunis",
  },
];

function PartnerCard({ item }: { item: Partner }) {
  return (
    <TouchableOpacity style={styles.partnerCard}>
      <View style={styles.partnerIcon}>
        <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.partnerName}>{item.name}</Text>
      <Text style={styles.partnerType}>{item.type}</Text>
    </TouchableOpacity>
  );
}

// Main Component
export default function Accueil() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [selectedMicrogreen, setSelectedMicrogreen] =
    useState<Microgreen | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [microgreenModalVisible, setMicrogreenModalVisible] =
    useState<boolean>(false);
  const [recipeModalVisible, setRecipeModalVisible] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* AI Assistant Card - Navigates to chat.tsx */}
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => router.push("/chat")}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiCardGradient}
          >
            <View style={styles.aiCardTop}>
              <View style={styles.aiTitle}>
                <Text style={styles.aiBubble}>💬</Text>
                <Text style={styles.aiTitleText}>Assistant MicroVita</Text>
              </View>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>Débutant/Avancé</Text>
              </View>
            </View>

            <View style={styles.aiInputBox}>
              <Text style={styles.aiPlaceholder}>Posez votre question sur les micro-pousses...</Text>
              <Text style={styles.aiSend}>➤</Text>
            </View>

            <Text style={styles.aiHint}>
              Posez une question ouverte (ex: Quels sont les bienfaits du brocoli ?)
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Section Micro-pousses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌱 Micro-pousses</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/microgreens")}>
              <Text style={styles.sectionAction}>Voir toutes →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {MICROGREENS.map((item) => (
              <FeaturedCard
                key={item.id}
                item={item}
                onPress={(item) => {
                  setSelectedMicrogreen(item);
                  setMicrogreenModalVisible(true);
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Section Recettes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🥗 Recettes</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/recipes")}>
              <Text style={styles.sectionAction}>Voir toutes →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recipesGrid}>
            {RECIPES.slice(0, 4).map((item) => (
              <RecipeCard
                key={item.id}
                item={item}
                onPress={(item) => {
                  setSelectedRecipe(item);
                  setRecipeModalVisible(true);
                }}
              />
            ))}
          </View>
        </View>

        {/* Section Partenaires */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤝 Partenaires</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/distr")}>
              <Text style={styles.sectionAction}>Voir tous →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {PARTNERS_DATA.map((item) => (
              <PartnerCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 MicroVita</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>À propos</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Contact</Text>
            </TouchableOpacity>
            <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Mentions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: H_PADDING,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionAction: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  horizontalScroll: {
    paddingHorizontal: H_PADDING,
    gap: 16,
  },
  featuredCard: {
    width: W * 0.7,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  featuredGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontStyle: "italic",
    marginBottom: 6,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
  },
  recipesGrid: {
    paddingHorizontal: H_PADDING,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  recipeCard: {
    width: (W - H_PADDING * 2 - 16) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recipeCardImage: {
    width: "100%",
    height: 100,
  },
  recipeCardContent: {
    padding: 10,
  },
  recipeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  recipeCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  recipeCardRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  recipeCardRatingText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.gold,
  },
  recipeCardMeta: {
    flexDirection: "row",
    gap: 10,
  },
  recipeCardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  recipeCardMetaText: {
    fontSize: 10,
    color: COLORS.textTertiary,
  },
  blogCard: {
    width: W * 0.7,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  blogCardImage: {
    width: "100%",
    height: 100,
  },
  blogCardContent: {
    padding: 12,
  },
  blogCardCategory: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  blogCardCategoryText: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.primary,
  },
  blogCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  blogCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  blogCardAuthor: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "500",
  },
  blogCardDate: {
    fontSize: 10,
    color: COLORS.textTertiary,
  },
  partnerCard: {
    width: 100,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  partnerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  partnerName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  partnerType: {
    fontSize: 10,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLink: {
    fontSize: 11,
    color: COLORS.primary,
  },
  footerDot: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  aiCard: {
    marginHorizontal: H_PADDING,
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  aiCardGradient: {
    padding: 20,
  },
  aiCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  aiTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiBubble: {
    fontSize: 18,
  },
  aiTitleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  aiBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  aiBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },
  aiInputBox: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  aiPlaceholder: {
    fontSize: 13,
    opacity: 0.9,
    color: "#fff",
  },
  aiSend: {
    fontSize: 18,
    color: "#fff",
  },
  aiHint: {
    fontSize: 11,
    opacity: 0.8,
    color: "#fff",
  },
});