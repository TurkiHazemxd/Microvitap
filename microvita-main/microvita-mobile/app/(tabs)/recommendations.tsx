// app/(tabs)/recommendations.tsx
// Import necessary dependencies
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { API_URL } from "../../src/config/api";
import { getUser } from "../../src/lib/auth";

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get("window");

// Color palette for consistent theming throughout the app
const COLORS = {
  primary: "#0b6e4f",
  primaryLight: "#dff2e6",
  primaryDark: "#095a40",
  bg: "#f6f7f6",
  card: "#ffffff",
  border: "rgba(0,0,0,0.08)",
  text: "#1a2e35",
  textSecondary: "#6c757d",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

// Helper function to show guest login prompt when unauthenticated user tries to access features
const showGuestLoginAlert = (router: any) => {
  Alert.alert(
    "Mode invité",
    "Veuillez vous connecter ou créer un compte pour accéder aux recommandations personnalisées",
    [
      { text: "Annuler", style: "cancel" },
      { text: "Se connecter", onPress: () => router.push("/login") },
      { text: "Créer un compte", onPress: () => router.push("/register") }
    ]
  );
};

// Map question IDs to user-friendly labels for display
const QUESTION_LABELS: Record<string, string> = {
  q1: "🍎 Fruits & légumes",
  q2: "🌱 Micro-pousses",
  q3: "🥩 Protéines",
  q4: "💧 Hydratation",
  q5: "🚫 Restrictions",
  q6: "🩺 Santé chronique",
  q7: "🤧 Allergies",
  q8: "🫃 Problèmes digestifs",
  q9: "💊 Médicaments",
  q10: "👨‍👩‍👧 Antécédents familiaux",
};

// Map option IDs to readable French labels for displaying answers
const OPTION_LABELS: Record<string, string> = {
  jamais: "Jamais",
  rarement: "Rarement",
  parfois: "Parfois",
  souvent: "Souvent",
  toujours: "Toujours",
  quotidien: "Quotidiennement",
  insuffisant: "Insuffisant",
  correct: "Correct",
  eleve: "Élevé",
  vegetal: "Principalement végétal",
  animal: "Principalement animal",
  moins_1l: "Moins de 1L/jour",
  "1_1_5l": "1L - 1.5L/jour",
  "1_5_2l": "1.5L - 2L/jour",
  plus_2l: "Plus de 2L/jour",
  aucune: "Aucune",
  vegetarien: "Végétarien",
  vegan: "Vegan",
  sans_gluten: "Sans gluten",
  sans_lactose: "Sans lactose",
  aucun: "Aucun",
  diabete: "Diabète",
  hypertension: "Hypertension",
  cholesterol: "Cholestérol",
  thyroide: "Problèmes de thyroïde",
  cardiaque: "Maladie cardiaque",
  arachides: "Arachides",
  fruits_mer: "Fruits de mer",
  lactose: "Lactose",
  gluten: "Gluten",
  oeufs: "Œufs",
  reflux: "Reflux gastrique",
  colopathie: "Colopathie fonctionnelle",
  constipation: "Constipation",
  ballonnements: "Ballonnements",
  occasionnel: "Occasionnellement",
  quotidiennement: "Quotidiennement",
  plusieurs: "Plusieurs par jour",
  cancer: "Cancer",
  osteoporose: "Ostéoporose",
  obesite: "Obésité",
  autre: "Autre",
};

// Define all quiz questions with their categories, types, and options
const QUESTIONS = [
  {
    id: "q1",
    category: "Habitudes alimentaires",
    title: "À quelle fréquence consommez-vous des fruits et légumes ?",
    type: "single",
    options: [
      { id: "jamais", label: "Jamais" },
      { id: "rarement", label: "Rarement (1-2x/semaine)" },
      { id: "parfois", label: "Parfois (3-4x/semaine)" },
      { id: "souvent", label: "Souvent (5-6x/semaine)" },
      { id: "toujours", label: "Tous les jours" },
      { id: "autre", label: "Autre" },
    ],
  },
  {
    id: "q2",
    category: "Habitudes alimentaires",
    title: "Consommez-vous des micro-pousses ?",
    type: "single",
    options: [
      { id: "jamais", label: "Jamais" },
      { id: "rarement", label: "Rarement" },
      { id: "parfois", label: "Parfois" },
      { id: "souvent", label: "Souvent" },
      { id: "quotidien", label: "Quotidiennement" },
      { id: "autre", label: "Autre" },
    ],
  },
  {
    id: "q3",
    category: "Habitudes alimentaires",
    title: "Quel est votre apport en protéines ?",
    type: "single",
    options: [
      { id: "insuffisant", label: "Insuffisant" },
      { id: "correct", label: "Correct" },
      { id: "eleve", label: "Élevé" },
      { id: "vegetal", label: "Principalement végétal" },
      { id: "animal", label: "Principalement animal" },
      { id: "autre", label: "Autre" },
    ],
  },
  {
    id: "q4",
    category: "Habitudes alimentaires",
    title: "Buvez-vous suffisamment d'eau ?",
    type: "single",
    options: [
      { id: "moins_1l", label: "Moins de 1L par jour" },
      { id: "1_1_5l", label: "1L - 1.5L par jour" },
      { id: "1_5_2l", label: "1.5L - 2L par jour" },
      { id: "plus_2l", label: "Plus de 2L par jour" },
      { id: "autre", label: "Autre" },
    ],
  },
  {
    id: "q5",
    category: "Habitudes alimentaires",
    title: "Avez-vous des restrictions alimentaires ?",
    type: "multiple",
    options: [
      { id: "aucune", label: "Aucune" },
      { id: "vegetarien", label: "Végétarien" },
      { id: "vegan", label: "Vegan" },
      { id: "sans_gluten", label: "Sans gluten" },
      { id: "sans_lactose", label: "Sans lactose" },
      { id: "autre", label: "Autre" },
    ],
  },
  {
    id: "q6",
    category: "Antécédents médicaux",
    title: "Avez-vous des problèmes de santé chroniques ?",
    type: "multiple",
    options: [
      { id: "aucun", label: "Aucun" },
      { id: "diabete", label: "Diabète" },
      { id: "hypertension", label: "Hypertension" },
      { id: "cholesterol", label: "Cholestérol" },
      { id: "thyroide", label: "Problèmes de thyroïde" },
      { id: "cardiaque", label: "Maladie cardiaque" },
      { id: "autre", label: "Autre" },
    ],
  },
  {
    id: "q7",
    category: "Antécédents médicaux",
    title: "Avez-vous des allergies alimentaires ?",
    type: "multiple",
    options: [
      { id: "aucune", label: "Aucune" },
      { id: "arachides", label: "Arachides" },
      { id: "fruits_mer", label: "Fruits de mer" },
      { id: "lactose", label: "Lactose" },
      { id: "gluten", label: "Gluten" },
      { id: "oeufs", label: "Œufs" },
      { id: "autre", label: "Autre" },
    ],
  },
  {
    id: "q8",
    category: "Antécédents médicaux",
    title: "Avez-vous des problèmes digestifs ?",
    type: "multiple",
    options: [
      { id: "aucun", label: "Aucun" },
      { id: "reflux", label: "Reflux gastrique" },
      { id: "colopathie", label: "Colopathie fonctionnelle" },
      { id: "constipation", label: "Constipation" },
      { id: "ballonnements", label: "Ballonnements" },
      { id: "autre", label: "Autre" },
    ],
  },
  {
    id: "q9",
    category: "Antécédents médicaux",
    title: "Prenez-vous des médicaments régulièrement ?",
    type: "single",
    options: [
      { id: "aucun", label: "Aucun" },
      { id: "occasionnel", label: "Occasionnellement" },
      { id: "quotidien", label: "Quotidiennement" },
      { id: "plusieurs", label: "Plusieurs par jour" },
      { id: "autre", label: "Autre" },
    ],
  },
  {
    id: "q10",
    category: "Antécédents médicaux",
    title: "Avez-vous des antécédents familiaux de maladies ?",
    type: "multiple",
    options: [
      { id: "aucun", label: "Aucun" },
      { id: "diabete", label: "Diabète" },
      { id: "cardiaque", label: "Maladies cardiaques" },
      { id: "cancer", label: "Cancer" },
      { id: "osteoporose", label: "Ostéoporose" },
      { id: "autre", label: "Autre" },
    ],
  },
];

// Type definitions for data structures
interface RecommendationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  answers: Record<string, any>;
  status: "pending" | "reviewed" | "completed";
  createdAt: string;
  nutritionistNotes?: string;
  assignedPlanId?: string;
}

interface NutritionalPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  dailyMeals: any[];
  recommendations: string[];
  supplements: string[];
  status: string;
  progress: number;
}

// Main component
export default function RecommendationsScreen() {
  // State management for UI and data flow
  const router = useRouter();
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [isGuest, setIsGuest] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // "Autre" input states
  const [autreInputs, setAutreInputs] = useState<Record<string, string>>({});
  const [showAutreInput, setShowAutreInput] = useState<Record<string, boolean>>({});
  
  // Data for nutritionist view
  const [recommendations, setRecommendations] = useState<RecommendationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RecommendationRequest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [notes, setNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assignedPlans, setAssignedPlans] = useState<NutritionalPlan[]>([]);
  
  // Plan management state
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<NutritionalPlan | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [plansList, setPlansList] = useState<NutritionalPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  // Plan creation form state
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planStartDate, setPlanStartDate] = useState("");
  const [planEndDate, setPlanEndDate] = useState("");
  const [planRecommendations, setPlanRecommendations] = useState("");
  const [planSupplements, setPlanSupplements] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
const [questionsLoading, setQuestionsLoading] = useState(true);
  
  // Quick plan creation modal state
  const [quickPlanModalVisible, setQuickPlanModalVisible] = useState(false);
  const [currentRequestForPlan, setCurrentRequestForPlan] = useState<RecommendationRequest | null>(null);
  const [quickPlanTitle, setQuickPlanTitle] = useState("");
  const [quickPlanDescription, setQuickPlanDescription] = useState("");
  const [quickPlanRecommendations, setQuickPlanRecommendations] = useState("");
  const [quickPlanSupplements, setQuickPlanSupplements] = useState("");
  
  // Plan context menu and edit functionality
  const [planContextMenuVisible, setPlanContextMenuVisible] = useState(false);
  const [selectedPlanForMenu, setSelectedPlanForMenu] = useState<NutritionalPlan | null>(null);
  const [planMenuPosition, setPlanMenuPosition] = useState({ x: 0, y: 0 });
  const [editPlanModalVisible, setEditPlanModalVisible] = useState(false);
  const [editPlanTitle, setEditPlanTitle] = useState("");
  const [editPlanDescription, setEditPlanDescription] = useState("");
  const [editPlanRecommendations, setEditPlanRecommendations] = useState("");
  const [editPlanSupplements, setEditPlanSupplements] = useState("");
  const [editingPlanId, setEditingPlanId] = useState("");

  // Initial load effects - runs when component mounts
  useEffect(() => {
    checkIfGuest();
    loadUserRole();
    loadCurrentUserName();
    loadSavedAnswers();
    loadQuestions();

  }, []);

  // Effect that runs when screen comes into focus (navigation-focused)
  useFocusEffect(
    useCallback(() => {
      if (userRole === "nutritionist") {
        loadRecommendationRequests();
        loadPlans();
      } else if (userRole === "consumer" && !isGuest) {
        loadAssignedPlans();
      }
      return () => {};
    }, [userRole, isGuest])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (userRole === "nutritionist") {
      await loadRecommendationRequests();
      await loadPlans();
    } else if (userRole === "consumer") {
      await loadAssignedPlans();
    }
    setRefreshing(false);
  }, [userRole]);

  // Authentication and user state functions
  const checkIfGuest = async () => {
    try {
      const user = await getUser();
      if (user?.isGuest || user?.role === 'guest') {
        setIsGuest(true);
        setUserRole("guest");
      } else {
        setIsGuest(false);
      }
    } catch (error) {
      console.error("Error checking guest mode:", error);
    }
  };
// Add this function
const loadQuestions = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      // Fallback to default questions
      setQuestions(questions);
      setQuestionsLoading(false);
      return;
    }

    const response = await fetch(`${API_URL}/api/questions`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions(questions);
      }
    } else {
      setQuestions(questions);
    }
  } catch (error) {
    console.error("Error loading questions:", error);
    setQuestions(questions);
  } finally {
    setQuestionsLoading(false);
  }
};

  const loadUserRole = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (!user.isGuest) {
          setUserRole(user.role);
          console.log("User role loaded:", user.role);
        }
      }
    } catch (error) {
      console.error("Error loading user role:", error);
    }
  };

  const loadCurrentUserName = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserName(user.name || user.fullname || "Utilisateur");
      }
    } catch (error) {
      console.error("Error loading user name:", error);
    }
  };

  const getUserId = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (error) {
      console.error("Error getting user ID:", error);
    }
    return null;
  };

  // Data loading functions for consumer view
  const loadAssignedPlans = async () => {
    if (userRole !== "consumer" || isGuest) return;
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const userId = await getUserId();
      
      const response = await fetch(`${API_URL}/api/nutrition/plans`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const allPlans = await response.json();
        const userPlans = allPlans.filter(plan => plan.assignedTo === userId);
        console.log("Filtered plans for user:", userPlans);
        setAssignedPlans(userPlans);
      }
    } catch (error) {
      console.error("Error loading assigned plans:", error);
    } finally {
      setLoading(false);
    }
  };

  // Data loading functions for nutritionist view
  const loadRecommendationRequests = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/recommendations`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
        console.log("Loaded recommendations:", data.length);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/nutrition/plans`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlansList(data);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Update recommendation request status (reviewed/completed)
  const updateRequestStatus = async (id: string, status: string, nutritionistNotes?: string) => {
    setUpdatingStatus(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/recommendations/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status, nutritionistNotes }),
      });

      if (response.ok) {
        Alert.alert("Succès", `Statut mis à jour : ${status === "reviewed" ? "Validé" : "Terminé"}`);
        await loadRecommendationRequests();
        await loadAssignedPlans();
        setDetailModalVisible(false);
        setNotes("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le statut");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Create a new nutritional plan without assigning it to a user
  const createPlanOnly = async () => {
    if (!quickPlanTitle.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un titre pour le plan");
      return;
    }

    setSavingPlan(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const planData = {
        title: quickPlanTitle.trim(),
        description: quickPlanDescription.trim(),
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        dailyMeals: [],
        recommendations: quickPlanRecommendations
          .split("\n")
          .filter(line => line.trim().length > 0)
          .map(line => line.trim()),
        supplements: quickPlanSupplements
          .split("\n")
          .filter(line => line.trim().length > 0)
          .map(line => line.trim()),
        status: "active",
        progress: 0
      };

      console.log("Creating plan with data:", JSON.stringify(planData, null, 2));

      const response = await fetch(`${API_URL}/api/nutrition/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(planData),
      });

      const responseText = await response.text();
      console.log("Create plan response status:", response.status);
      console.log("Create plan response body:", responseText);

      if (response.ok) {
        let newPlan;
        try {
          newPlan = JSON.parse(responseText);
        } catch (e) {
          newPlan = { id: responseText };
        }
        
        console.log("Plan created:", newPlan);
        
        Alert.alert("Succès", "Plan créé avec succès ! Vous pouvez maintenant le sélectionner dans la liste.");
        await loadPlans();
        setQuickPlanModalVisible(false);
        resetQuickPlanForm();
      } else {
        let errorMessage = "Impossible de créer le plan";
        try {
          const error = JSON.parse(responseText);
          errorMessage = error.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        Alert.alert("Erreur", errorMessage);
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      Alert.alert("Erreur", "Impossible de créer le plan: " + error.message);
    } finally {
      setSavingPlan(false);
    }
  };

  // Update an existing nutritional plan
  const updatePlan = async () => {
    if (!editPlanTitle.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un titre pour le plan");
      return;
    }

    setSavingPlan(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const planData = {
        title: editPlanTitle.trim(),
        description: editPlanDescription.trim(),
        recommendations: editPlanRecommendations
          .split("\n")
          .filter(line => line.trim().length > 0)
          .map(line => line.trim()),
        supplements: editPlanSupplements
          .split("\n")
          .filter(line => line.trim().length > 0)
          .map(line => line.trim()),
      };

      const response = await fetch(`${API_URL}/api/nutrition/plans/${editingPlanId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        Alert.alert("Succès", "Plan modifié avec succès");
        await loadPlans();
        setEditPlanModalVisible(false);
        resetEditPlanForm();
      } else {
        const error = await response.json();
        Alert.alert("Erreur", error.message || "Impossible de modifier le plan");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      Alert.alert("Erreur", "Impossible de modifier le plan");
    } finally {
      setSavingPlan(false);
    }
  };

  // Delete a nutritional plan
  const deletePlan = async (planId: string, planTitle: string) => {
    Alert.alert(
      "Supprimer le plan",
      `Voulez-vous vraiment supprimer "${planTitle}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("auth_token");
              const response = await fetch(`${API_URL}/api/nutrition/plans/${planId}`, {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert("Succès", "Plan supprimé avec succès");
                await loadPlans();
                if (selectedPlanId === planId) {
                  setSelectedPlanId("");
                }
                setPlanContextMenuVisible(false);
                setSelectedPlanForMenu(null);
              } else {
                const error = await response.json();
                Alert.alert("Erreur", error.message || "Impossible de supprimer le plan");
              }
            } catch (error) {
              console.error("Error deleting plan:", error);
              Alert.alert("Erreur", "Impossible de supprimer le plan");
            }
          },
        },
      ]
    );
  };

  // Show context menu for plan actions (edit/delete)
  const showPlanContextMenu = (plan: NutritionalPlan, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setPlanMenuPosition({ x: pageX, y: pageY });
    setSelectedPlanForMenu(plan);
    setPlanContextMenuVisible(true);
  };

  // Open edit plan modal with pre-filled data
  const openEditPlanModal = (plan: NutritionalPlan) => {
    setEditingPlanId(plan.id);
    setEditPlanTitle(plan.title);
    setEditPlanDescription(plan.description || "");
    setEditPlanRecommendations(plan.recommendations ? plan.recommendations.join("\n") : "");
    setEditPlanSupplements(plan.supplements ? plan.supplements.join("\n") : "");
    setPlanContextMenuVisible(false);
    setEditPlanModalVisible(true);
  };

  // Reset edit plan form fields
  const resetEditPlanForm = () => {
    setEditPlanTitle("");
    setEditPlanDescription("");
    setEditPlanRecommendations("");
    setEditPlanSupplements("");
    setEditingPlanId("");
  };

  // Complete a recommendation request and assign a plan to the consumer
  const completeAndAssignPlan = async (requestId: string, planId: string) => {
    if (!planId) {
      Alert.alert("Erreur", "Veuillez sélectionner un plan à assigner");
      return;
    }

    setUpdatingStatus(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      console.log("=== COMPLETE AND ASSIGN PLAN DEBUG ===");
      console.log("Request ID:", requestId);
      console.log("Plan ID:", planId);
      console.log("Notes:", notes);
      
      const assignResponse = await fetch(`${API_URL}/api/recommendations/${requestId}/assign-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const assignResult = await assignResponse.json();
      console.log("Assign response:", assignResult);

      if (assignResponse.ok) {
        const completeResponse = await fetch(`${API_URL}/api/recommendations/${requestId}/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            status: "completed", 
            nutritionistNotes: notes || `Plan assigné: ${plansList.find(p => p.id === planId)?.title || "Plan nutritionnel"}`
          }),
        });

        if (completeResponse.ok) {
          Alert.alert("Succès", "Plan assigné et demande marquée comme terminée. Le consommateur peut maintenant voir son plan.");
          await loadRecommendationRequests();
          await loadAssignedPlans();
          setDetailModalVisible(false);
          setSelectedPlanId("");
          setNotes("");
        } else {
          Alert.alert("Erreur", "Le plan a été assigné mais impossible de marquer comme terminé");
        }
      } else {
        Alert.alert("Erreur", assignResult.message || "Impossible d'assigner le plan");
      }
    } catch (error) {
      console.error("Error completing and assigning plan:", error);
      Alert.alert("Erreur", "Impossible de terminer la demande");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Complete a recommendation request without assigning a plan
  const completeWithoutPlan = async (requestId: string) => {
    setUpdatingStatus(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${API_URL}/api/recommendations/${requestId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: "completed", 
          nutritionistNotes: notes || "Demande traitée sans plan nutritionnel"
        }),
      });

      if (response.ok) {
        Alert.alert("Succès", "Demande marquée comme terminée");
        await loadRecommendationRequests();
        setDetailModalVisible(false);
        setNotes("");
      } else {
        const error = await response.json();
        Alert.alert("Erreur", error.message || "Impossible de marquer comme terminé");
      }
    } catch (error) {
      console.error("Error completing:", error);
      Alert.alert("Erreur", "Impossible de marquer comme terminé");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Reset quick plan form fields
  const resetQuickPlanForm = () => {
    setQuickPlanTitle("");
    setQuickPlanDescription("");
    setQuickPlanRecommendations("");
    setQuickPlanSupplements("");
    setCurrentRequestForPlan(null);
  };

  // Validate a request without plan (mark as reviewed)
  const validateWithoutPlan = async (requestId: string) => {
    setUpdatingStatus(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${API_URL}/api/recommendations/${requestId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: "reviewed", 
          nutritionistNotes: notes || "Demande validée sans plan" 
        }),
      });

      if (response.ok) {
        Alert.alert("Succès", "Demande validée avec succès");
        await loadRecommendationRequests();
        setDetailModalVisible(false);
        setNotes("");
      } else {
        const error = await response.json();
        Alert.alert("Erreur", error.message || "Impossible de valider la demande");
      }
    } catch (error) {
      console.error("Error validating:", error);
      Alert.alert("Erreur", "Impossible de valider la demande");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Reset plan creation form fields
  const resetPlanForm = () => {
    setPlanTitle("");
    setPlanDescription("");
    setPlanStartDate("");
    setPlanEndDate("");
    setPlanRecommendations("");
    setPlanSupplements("");
    setSelectedPlanId("");
  };

  // Load previously saved quiz answers from backend
  const loadSavedAnswers = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;
      
      const response = await fetch(`${API_URL}/api/recommendations/user`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const latestRecommendation = data[0];
          if (latestRecommendation.answers && Object.keys(latestRecommendation.answers).length > 0) {
            setAnswers(latestRecommendation.answers);
            console.log("Loaded saved answers from backend:", Object.keys(latestRecommendation.answers).length);
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved answers:", error);
    }
  };

  // Save answers to local storage
  const saveAnswers = async (newAnswers: Record<string, any>) => {
    try {
      await AsyncStorage.setItem("quiz_answers", JSON.stringify(newAnswers));
    } catch (error) {
      console.error("Error saving answers:", error);
    }
  };

  // Quiz interaction handlers
  const toggleAutreInput = (questionId: string) => {
    setShowAutreInput(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
    // If closing, remove the "autre" selection if it exists
    if (showAutreInput[questionId]) {
      const currentAnswer = answers[questionId];
      const question = QUESTIONS.find(q => q.id === questionId);
      if (question?.type === 'single') {
        if (typeof currentAnswer === 'string' && currentAnswer.startsWith('autre:')) {
          const newAnswers = { ...answers };
          delete newAnswers[questionId];
          setAnswers(newAnswers);
        }
      } else {
        if (Array.isArray(currentAnswer)) {
          const filtered = currentAnswer.filter((a: string) => !a.startsWith('autre:'));
          const newAnswers = { ...answers, [questionId]: filtered };
          setAnswers(newAnswers);
        }
      }
    }
  };

  const handleSingleSelect = (questionId: string, optionId: string) => {
    if (optionId === 'autre') {
      toggleAutreInput(questionId);
      return;
    }
    if (showAutreInput[questionId]) {
      setShowAutreInput(prev => ({ ...prev, [questionId]: false }));
    }
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);
    saveAnswers(newAnswers);
  };

  const handleMultipleSelect = (questionId: string, optionId: string) => {
    if (optionId === 'autre') {
      toggleAutreInput(questionId);
      return;
    }
    
    const currentSelections = answers[questionId] || [];
    let newSelections;
    
    if (optionId === "aucun" || optionId === "aucune") {
      if (showAutreInput[questionId]) {
        setShowAutreInput(prev => ({ ...prev, [questionId]: false }));
      }
      newSelections = [optionId];
    } else {
      let filtered = currentSelections.filter((id: string) => id !== "aucun" && id !== "aucune");
      filtered = filtered.filter((id: string) => !id.startsWith('autre:'));
      if (showAutreInput[questionId]) {
        setShowAutreInput(prev => ({ ...prev, [questionId]: false }));
      }
      if (filtered.includes(optionId)) {
        newSelections = filtered.filter((id: string) => id !== optionId);
      } else {
        newSelections = [...filtered, optionId];
      }
    }
    
    const newAnswers = { ...answers, [questionId]: newSelections };
    setAnswers(newAnswers);
    saveAnswers(newAnswers);
  };

  const handleAutreTextChange = (questionId: string, text: string) => {
    setAutreInputs(prev => ({ ...prev, [questionId]: text }));
    const question = QUESTIONS.find(q => q.id === questionId);
    if (question?.type === 'single') {
      if (text.trim()) {
        const newAnswers = { ...answers, [questionId]: `autre: ${text.trim()}` };
        setAnswers(newAnswers);
        saveAnswers(newAnswers);
      } else {
        const newAnswers = { ...answers };
        delete newAnswers[questionId];
        setAnswers(newAnswers);
        saveAnswers(newAnswers);
      }
    } else {
      const currentSelections = answers[questionId] || [];
      const filtered = currentSelections.filter((id: string) => !id.startsWith('autre:'));
      if (text.trim()) {
        const newSelections = [...filtered, `autre: ${text.trim()}`];
        const newAnswers = { ...answers, [questionId]: newSelections };
        setAnswers(newAnswers);
        saveAnswers(newAnswers);
      } else {
        const newAnswers = { ...answers, [questionId]: filtered };
        setAnswers(newAnswers);
        saveAnswers(newAnswers);
      }
    }
  };

  const isOptionSelected = (questionId: string, optionId: string): boolean => {
    const answer = answers[questionId];
    if (!answer) return false;
    if (Array.isArray(answer)) {
      if (optionId === 'autre') {
        return answer.some((a: string) => a.startsWith('autre:'));
      }
      return answer.includes(optionId);
    }
    if (optionId === 'autre') {
      return answer.startsWith('autre:');
    }
    return answer === optionId;
  };

  const isAutreSelected = (questionId: string): boolean => {
    const answer = answers[questionId];
    if (!answer) return false;
    if (Array.isArray(answer)) {
      return answer.some((a: string) => a.startsWith('autre:'));
    }
    return answer.startsWith('autre:');
  };

  const getAutreText = (questionId: string): string => {
    const answer = answers[questionId];
    if (!answer) return '';
    let autreValue = '';
    if (Array.isArray(answer)) {
      const autreItem = answer.find((a: string) => a.startsWith('autre:'));
      if (autreItem) {
        autreValue = autreItem.replace('autre: ', '');
      }
    } else if (answer.startsWith('autre:')) {
      autreValue = answer.replace('autre: ', '');
    }
    return autreValue;
  };

  // Navigation through quiz questions
  const handleNext = () => {
    const currentQuestion = QUESTIONS[currentStep];
    const currentAnswer = answers[currentQuestion.id];
    
    if (showAutreInput[currentQuestion.id]) {
      const autreText = autreInputs[currentQuestion.id] || '';
      if (!autreText.trim()) {
        Alert.alert("Information manquante", "Veuillez saisir votre réponse personnalisée ou fermer l'option Autre.");
        return;
      }
    }
    
    if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      Alert.alert("Information manquante", "Veuillez sélectionner une réponse avant de continuer.");
      return;
    }
    
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit quiz answers to backend
  const submitQuiz = async () => {
    if (isGuest) {
      setLoading(false);
      showGuestLoginAlert(router);
      setShowQuiz(false);
      return;
    }
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const payload = {
        answers,
        userName: currentUserName,
      };
      
      const response = await fetch(`${API_URL}/api/recommendations/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await AsyncStorage.removeItem("quiz_answers");
        setShowQuiz(false);
        setCurrentStep(0);
        setAnswers({});
        Alert.alert("Succès", "Vos réponses ont été enregistrées. Un nutritionniste les analysera bientôt.");
      } else {
        const data = await response.json();
        Alert.alert("Erreur", data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      Alert.alert("Erreur", "Impossible d'envoyer le questionnaire");
    } finally {
      setLoading(false);
    }
  };

  // Reset quiz state
  const resetQuiz = () => {
    setCurrentStep(0);
  };

  // Close success modal and reset state
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setShowQuiz(false);
    setCurrentStep(0);
    setAnswers({});
    loadAssignedPlans();
  };

  // Helper function to display answer values in readable format
  const getAnswerDisplay = (answer: any): string => {
    if (Array.isArray(answer)) {
      if (answer.length === 1 && (answer[0] === "aucun" || answer[0] === "aucune")) {
        return "Aucun";
      }
      return answer.map(a => {
        if (a.startsWith('autre:')) {
          return a.replace('autre: ', '');
        }
        return OPTION_LABELS[a] || a;
      }).join(", ");
    }
    if (typeof answer === 'string' && answer.startsWith('autre:')) {
      return answer.replace('autre: ', '');
    }
    return OPTION_LABELS[answer] || answer;
  };

  // Get styling for status badges based on request status
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return { backgroundColor: COLORS.warning + "20", color: COLORS.warning };
      case "reviewed":
        return { backgroundColor: COLORS.success + "20", color: COLORS.success };
      case "completed":
        return { backgroundColor: COLORS.info + "20", color: COLORS.info };
      default:
        return { backgroundColor: COLORS.border, color: COLORS.textSecondary };
    }
  };

  // Get human-readable status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "reviewed":
        return "Validé";
      case "completed":
        return "Terminé";
      default:
        return status;
    }
  };

  // Format date for display (French format)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get user initials for avatar display
  const getInitials = (name: string) => {
    if (!name || name === "Utilisateur") return "U";
    return name.charAt(0).toUpperCase();
  };

  // Modal component for displaying plan details
  const PlanDetailModal = () => (
    <Modal
      visible={showPlanDetails && selectedPlan !== null}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setShowPlanDetails(false)}
    >
      <SafeAreaView style={styles.detailModalContainer}>
        <View style={styles.detailModalHeader}>
          <TouchableOpacity onPress={() => setShowPlanDetails(false)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.detailModalTitle}>Détails du plan</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailModalContent}>
          <View style={styles.planDetailHeader}>
            <View style={styles.planIconContainer}>
              <Ionicons name="nutrition-outline" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.planDetailTitle}>{selectedPlan?.title}</Text>
            <Text style={styles.planDetailDescription}>{selectedPlan?.description}</Text>
            <View style={styles.planDetailDates}>
              <View style={styles.planDetailDate}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.planDetailDateText}>Début: {formatDate(selectedPlan?.startDate || "")}</Text>
              </View>
              <View style={styles.planDetailDate}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.planDetailDateText}>Fin: {formatDate(selectedPlan?.endDate || "")}</Text>
              </View>
            </View>
          </View>

          {selectedPlan?.recommendations && selectedPlan.recommendations.length > 0 && (
            <View style={styles.planSection}>
              <Text style={styles.planSectionTitle}>Recommandations</Text>
              {selectedPlan.recommendations.map((rec, index) => (
                <View key={index} style={styles.planBulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                  <Text style={styles.planBulletText}>{rec}</Text>
                </View>
              ))}
            </View>
          )}

          {selectedPlan?.supplements && selectedPlan.supplements.length > 0 && (
            <View style={styles.planSection}>
              <Text style={styles.planSectionTitle}>Suppléments recommandés</Text>
              <View style={styles.supplementsList}>
                {selectedPlan.supplements.map((sup, index) => (
                  <View key={index} style={styles.supplementChip}>
                    <Ionicons name="medkit-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.supplementChipText}>{sup}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Guest mode view - show login prompt
  if (isGuest) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <View style={styles.guestContainer}>
          <View style={styles.guestIconContainer}>
            <Ionicons name="lock-closed-outline" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.guestTitle}>Mode invité</Text>
          <Text style={styles.guestMessage}>
            Connectez-vous ou créez un compte pour accéder aux recommandations nutritionnelles personnalisées.
          </Text>
          <TouchableOpacity 
            style={styles.guestLoginButton} 
            onPress={() => router.push("/login")}
          >
            <Text style={styles.guestLoginButtonText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.guestRegisterButton} 
            onPress={() => router.push("/register")}
          >
            <Text style={styles.guestRegisterButtonText}>Créer un compte</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.guestBackButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.guestBackButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Nutritionist view - show recommendation requests and management interface
  if (userRole === "nutritionist") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Demandes de plans nutritionnels</Text>
          <Text style={styles.headerSubtitle}>
            {recommendations.length} demande{recommendations.length > 1 ? "s" : ""}
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : recommendations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucune demande pour le moment</Text>
            <Text style={styles.emptySubText}>Tirez vers le bas pour actualiser</Text>
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.requestsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
            }
          >
            {recommendations.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {getInitials(request.userName || "Utilisateur")}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{request.userName || "Utilisateur"}</Text>
                    <Text style={styles.requestDateSmall}>Soumis le {formatDate(request.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeStyle(request.status).backgroundColor }]}>
                    <Text style={[styles.statusText, { color: getStatusBadgeStyle(request.status).color }]}>
                      {getStatusText(request.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => {
                      setSelectedRequest(request);
                      setDetailModalVisible(true);
                    }}
                  >
                    <Text style={styles.detailsButtonText}>Voir les détails</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Detail Modal for viewing individual request */}
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <SafeAreaView style={styles.detailModalContainer}>
            <View style={styles.detailModalHeader}>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.detailModalTitle}>Détails de la demande</Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedRequest && (
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.detailModalContent}
              >
                <View style={styles.userInfoSection}>
                  <View style={styles.userAvatarLarge}>
                    <Text style={styles.userAvatarLargeText}>
                      {getInitials(selectedRequest.userName || "U")}
                    </Text>
                  </View>
                  <Text style={styles.userInfoName}>{selectedRequest.userName || "Utilisateur"}</Text>
                  
                  <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusBadgeStyle(selectedRequest.status).backgroundColor }]}>
                    <Text style={[styles.statusTextLarge, { color: getStatusBadgeStyle(selectedRequest.status).color }]}>
                      {getStatusText(selectedRequest.status)}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>Soumis le {formatDate(selectedRequest.createdAt)}</Text>
                </View>

                <View style={styles.answersSection}>
                  <Text style={styles.sectionTitle}>Réponses du consommateur</Text>
                  {Object.entries(selectedRequest.answers).map(([questionId, answer]) => {
                    let shortTitle = "";
                    switch(questionId) {
                      case "q1": shortTitle = "Fréquence consommation fruits et légumes"; break;
                      case "q2": shortTitle = "Consommation micro-pousses"; break;
                      case "q3": shortTitle = "Apport en protéines"; break;
                      case "q4": shortTitle = "Hydratation (eau)"; break;
                      case "q5": shortTitle = "Restrictions alimentaires"; break;
                      case "q6": shortTitle = "Problèmes de santé chroniques"; break;
                      case "q7": shortTitle = "Allergies alimentaires"; break;
                      case "q8": shortTitle = "Problèmes digestifs"; break;
                      case "q9": shortTitle = "Médicaments réguliers"; break;
                      case "q10": shortTitle = "Antécédents familiaux"; break;
                      default: shortTitle = questionId;
                    }
                    return (
                      <View key={questionId} style={styles.answerItem}>
                        <Text style={styles.questionText}>{shortTitle}</Text>
                        <Text style={styles.answerText}>{getAnswerDisplay(answer)}</Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Notes du nutritionniste</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Ajouter des notes ou recommandations..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.assignPlanSection}>
                  <Text style={styles.sectionTitle}>Assigner un plan nutritionnel</Text>
                  
                  <TouchableOpacity
                    style={styles.createNewPlanButton}
                    onPress={() => {
                      setCurrentRequestForPlan(selectedRequest);
                      setQuickPlanModalVisible(true);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.createNewPlanButtonText}>Créer un nouveau plan</Text>
                  </TouchableOpacity>

                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OU</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {loadingPlans ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : plansList.length === 0 ? (
                    <Text style={styles.noPlansText}>Aucun plan disponible. Créez-en un d'abord.</Text>
                  ) : (
                    <View style={styles.plansList}>
                      {plansList.map((plan) => (
                        <TouchableOpacity
                          key={plan.id}
                          style={[
                            styles.planItem,
                            selectedPlanId === plan.id && styles.planItemSelected,
                          ]}
                          onPress={() => setSelectedPlanId(plan.id)}
                          onLongPress={(event) => showPlanContextMenu(plan, event)}
                          delayLongPress={300}
                        >
                          <View style={styles.planItemContent}>
                            <Text style={styles.planTitle}>{plan.title}</Text>
                            <Text style={styles.planDescription} numberOfLines={2}>{plan.description}</Text>
                          </View>
                          <View style={styles.planItemRight}>
                            {selectedPlanId === plan.id && (
                              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                            )}
                            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {selectedPlanId && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.assignButton]}
                      onPress={() => completeAndAssignPlan(selectedRequest.id, selectedPlanId)}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.actionButtonText}>Assigner plan</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => completeWithoutPlan(selectedRequest.id)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonText}>Terminer</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </SafeAreaView>
        </Modal>

        {/* Quick Plan Creation Modal */}
        <Modal
          visible={quickPlanModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setQuickPlanModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setQuickPlanModalVisible(false)}>
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Créer un plan</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre du plan *</Text>
                <TextInput
                  style={styles.input}
                  value={quickPlanTitle}
                  onChangeText={setQuickPlanTitle}
                  placeholder="Ex: Plan Détox 7 jours"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={quickPlanDescription}
                  onChangeText={setQuickPlanDescription}
                  placeholder="Description du plan..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recommandations (une ligne par recommandation)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={quickPlanRecommendations}
                  onChangeText={setQuickPlanRecommendations}
                  placeholder="Boire 2L d'eau par jour&#10;Éviter les aliments transformés"
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Suppléments (une ligne par supplément)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={quickPlanSupplements}
                  onChangeText={setQuickPlanSupplements}
                  placeholder="Vitamine D&#10;Oméga-3"
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, savingPlan && styles.submitButtonDisabled]}
                onPress={createPlanOnly}
                disabled={savingPlan}
              >
                {savingPlan ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Créer le plan</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Plan Context Menu Modal */}
        <Modal
          visible={planContextMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPlanContextMenuVisible(false)}
        >
          <Pressable style={styles.contextMenuOverlay} onPress={() => setPlanContextMenuVisible(false)}>
            <View
              style={[
                styles.contextMenu,
                {
                  top: planMenuPosition.y - 100,
                  left: planMenuPosition.x - 100,
                  backgroundColor: COLORS.card,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.contextMenuItem}
                onPress={() => selectedPlanForMenu && openEditPlanModal(selectedPlanForMenu)}
              >
                <Ionicons name="create-outline" size={20} color={COLORS.info} />
                <Text style={[styles.contextMenuItemText, { color: COLORS.text }]}>Modifier</Text>
              </TouchableOpacity>
              <View style={[styles.contextMenuDivider, { backgroundColor: COLORS.border }]} />
              <TouchableOpacity
                style={[styles.contextMenuItem, styles.contextMenuItemDanger]}
                onPress={() => selectedPlanForMenu && deletePlan(selectedPlanForMenu.id, selectedPlanForMenu.title)}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                <Text style={[styles.contextMenuItemText, { color: COLORS.danger }]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* Edit Plan Modal */}
        <Modal
          visible={editPlanModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setEditPlanModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditPlanModalVisible(false)}>
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Modifier le plan</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre du plan *</Text>
                <TextInput
                  style={styles.input}
                  value={editPlanTitle}
                  onChangeText={setEditPlanTitle}
                  placeholder="Ex: Plan Détox 7 jours"
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editPlanDescription}
                  onChangeText={setEditPlanDescription}
                  placeholder="Description du plan..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recommandations (une ligne par recommandation)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editPlanRecommendations}
                  onChangeText={setEditPlanRecommendations}
                  placeholder="Boire 2L d'eau par jour&#10;Éviter les aliments transformés"
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Suppléments (une ligne par supplément)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editPlanSupplements}
                  onChangeText={setEditPlanSupplements}
                  placeholder="Vitamine D&#10;Oméga-3"
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, savingPlan && styles.submitButtonDisabled]}
                onPress={updatePlan}
                disabled={savingPlan}
              >
                {savingPlan ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Enregistrer les modifications</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // Quiz view - show when user is taking the questionnaire
  // Quiz view - show when user is taking the questionnaire
if (showQuiz) {
  // Use questions state, fallback to QUESTIONS if empty
  const currentQuestions = questions.length > 0 ? questions : QUESTIONS;
  const currentQuestion = currentQuestions[currentStep];
  
  // If still no questions, show loading
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Chargement des questions...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const progress = ((currentStep + 1) / currentQuestions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
        <TouchableOpacity 
          onPress={() => {
            setShowQuiz(false);
            setCurrentStep(0);
            setAnswers({});
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600", color: COLORS.text }}>
          Questionnaire
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Question {currentStep + 1} / {currentQuestions.length}
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.questionContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{currentQuestion.category}</Text>
          </View>
          <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options && currentQuestion.options.map((option: any) => {
              const isSelected = option.id === 'autre' ? isAutreSelected(currentQuestion.id) : isOptionSelected(currentQuestion.id, option.id);
              const showInput = showAutreInput[currentQuestion.id] || false;
              
              return (
                <View key={option.id}>
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => {
                      if (currentQuestion.type === "single") {
                        handleSingleSelect(currentQuestion.id, option.id);
                      } else {
                        handleMultipleSelect(currentQuestion.id, option.id);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    {isSelected && currentQuestion.type === "single" && (
                      <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                    )}
                    {isSelected && currentQuestion.type === "multiple" && (
                      <View style={styles.checkboxSelected}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                    {!isSelected && currentQuestion.type === "multiple" && (
                      <View style={styles.checkbox} />
                    )}
                  </TouchableOpacity>
                  
                  {option.id === 'autre' && (showInput || isAutreSelected(currentQuestion.id)) && (
                    <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
                      <TextInput
                        style={{
                          backgroundColor: '#fff',
                          borderWidth: 1,
                          borderColor: COLORS.primary,
                          borderRadius: 8,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          fontSize: 15,
                          color: COLORS.text,
                        }}
                        placeholder="Saisissez votre réponse..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={getAutreText(currentQuestion.id) || autreInputs[currentQuestion.id] || ''}
                        onChangeText={(text) => {
                          setAutreInputs(prev => ({ ...prev, [currentQuestion.id]: text }));
                          handleAutreTextChange(currentQuestion.id, text);
                        }}
                        autoFocus
                        multiline={false}
                      />
                      {isAutreSelected(currentQuestion.id) && (
                        <Text style={{ fontSize: 12, color: COLORS.primary, marginTop: 4, fontStyle: 'italic' }}>
                          ✓ Réponse personnalisée enregistrée
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrevious}>
            <Text style={styles.prevButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === currentQuestions.length - 1 ? "Envoyer" : "Suivant"}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingTitle}>Envoi en cours...</Text>
            <Text style={styles.loadingMessage}>Veuillez patienter</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

  // Success modal after quiz submission
  if (showSuccessModal) {
    return (
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSuccessContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={70} color={COLORS.success} />
            </View>
            <Text style={styles.modalTitle}>Questionnaire envoyé !</Text>
            <Text style={styles.modalMessage}>
              Vos réponses ont bien été enregistrées.
            </Text>
            <Text style={styles.modalSubMessage}>
              Un nutritionniste va analyser votre profil. Vous recevrez bientôt vos recommandations personnalisées.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeSuccessModal}>
              <Text style={styles.modalButtonText}>Voir mes plans</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Consumer view - show assigned nutritional plans
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {assignedPlans.length > 0 ? (
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Mes plans nutritionnels</Text>
            {assignedPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                onPress={() => {
                  setSelectedPlan(plan);
                  setShowPlanDetails(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.planCardHeader}>
                  <View style={styles.planCardIcon}>
                    <Ionicons name="leaf-outline" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.planCardInfo}>
                    <Text style={styles.planCardTitle}>{plan.title}</Text>
                    <Text style={styles.planCardStatus}>Actif</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </View>
                {plan.description ? (
                  <Text style={styles.planCardDescription} numberOfLines={2}>
                    {plan.description}
                  </Text>
                ) : null}
                <View style={styles.planCardDates}>
                  <Text style={styles.planCardDate}>Du {formatDate(plan.startDate)}</Text>
                  <Text style={styles.planCardDate}>au {formatDate(plan.endDate)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noPlansMessage}>
            <Text style={styles.noPlansText}>Aucun plan pour le moment</Text>
          </View>
        )}

        <View style={styles.askSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="nutrition-outline" size={70} color={COLORS.primary} />
          </View>
          
          <Text style={styles.title}>Plan Nutritionnel</Text>
          <Text style={styles.subtitle}>
            Répondez à quelques questions sur vos habitudes alimentaires et vos antécédents médicaux
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={async () => {
              if (isGuest) {
                showGuestLoginAlert(router);
              } else {
                try {
                  const token = await AsyncStorage.getItem("auth_token");
                  if (token) {
                    const response = await fetch(`${API_URL}/api/recommendations/user`, {
                      headers: { "Authorization": `Bearer ${token}` },
                    });
                    if (response.ok) {
                      const data = await response.json();
                      if (data && data.length > 0 && data[0].answers) {
                        setAnswers(data[0].answers);
                      }
                    }
                  }
                } catch (error) {
                  console.error("Error loading answers:", error);
                }
                setShowQuiz(true);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Commencer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PlanDetailModal />
    </SafeAreaView>
  );
}

// Styles - keeping all original styles unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  requestsList: {
    padding: 16,
    gap: 16,
  },
  requestCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  requestDateSmall: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  createPlanForUserButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createPlanForUserButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  detailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  detailModalContent: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
  },
  userInfoSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatarLargeText: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.primary,
  },
  userInfoName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  userInfoEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  statusTextLarge: {
    fontSize: 13,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  answersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  answerItem: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.text,
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: "top",
  },
  assignPlanSection: {
    marginBottom: 24,
  },
  createNewPlanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  createNewPlanButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  plansList: {
    gap: 12,
    marginTop: 12,
  },
  planItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  planItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  planItemContent: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  planDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  planItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noPlansText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
  assignButton: {
    backgroundColor: COLORS.primary,
    marginTop: 16,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  validateButton: {
    backgroundColor: COLORS.success,
  },
  completeButton: {
    backgroundColor: COLORS.info,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  landingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  questionContainer: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  checkboxSelected: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  navigationButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  prevButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  prevButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.primary,
  },
  nextButton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: width * 0.7,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  loadingMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSuccessContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  plansSection: {
    padding: 20,
    paddingBottom: 10,
  },
  planCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  planCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  planCardInfo: {
    flex: 1,
  },
  planCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  planCardStatus: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 2,
  },
  planCardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  planCardDates: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planCardDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  askSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    paddingTop: 10,
  },
  noPlansMessage: {
    padding: 40,
    alignItems: "center",
  },
  planDetailHeader: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  planIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  planDetailTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  planDetailDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  planDetailDates: {
    flexDirection: "row",
    gap: 16,
  },
  planDetailDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  planDetailDateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  planSection: {
    marginBottom: 24,
  },
  planSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  planBulletPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  planBulletText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  supplementsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  supplementChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  supplementChipText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: COLORS.bg,
  },
  guestIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    textAlign: "center",
  },
  guestMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  guestLoginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  guestLoginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  guestRegisterButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  guestRegisterButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  guestBackButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  guestBackButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  contextMenuOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contextMenu: {
    position: "absolute",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 2000,
  },
  contextMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  contextMenuItemText: {
    fontSize: 15,
  },
  contextMenuDivider: {
    height: 1,
    marginVertical: 4,
  },
});