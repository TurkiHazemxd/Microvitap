// app/(tabs)/admin.tsx - Updated with Question Management
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../src/config/api";

const { width: W } = Dimensions.get("window");
const H_PADDING = 20;

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
  danger: "#E76F51",
  success: "#4A7856",
  warning: "#F4A261",
  info: "#6B9080",
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin: string;
  phone?: string;
  country?: string;
}

interface Question {
  id: string;
  category: string;
  title: string;
  type: "single" | "multiple";
  options: { id: string; label: string }[];
}

const USER_ROLES = [
  { id: "consumer", name: "Consommateur", icon: "person-outline", color: COLORS.info },
  { id: "biologist", name: "Biologiste", icon: "leaf-outline", color: COLORS.success },
  { id: "nutritionist", name: "Nutritionniste", icon: "nutrition-outline", color: COLORS.warning },
  { id: "distributor", name: "Distributeur", icon: "storefront-outline", color: COLORS.secondary },
  { id: "admin", name: "Administrateur", icon: "shield-checkmark-outline", color: COLORS.danger },
];

// Professional roles (excluding consumer)
const PROFESSIONAL_ROLES = [
  { id: "biologist", name: "Biologiste", icon: "leaf-outline", color: COLORS.success },
  { id: "nutritionist", name: "Nutritionniste", icon: "nutrition-outline", color: COLORS.warning },
  { id: "distributor", name: "Distributeur", icon: "storefront-outline", color: COLORS.secondary },
  { id: "admin", name: "Administrateur", icon: "shield-checkmark-outline", color: COLORS.danger },
];

// Default questions (same as in Profile and Recommendations)
const DEFAULT_QUESTIONS: Question[] = [
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

export default function AdminScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [adminCreateModalVisible, setAdminCreateModalVisible] = useState(false);
  const [professionalCreateModalVisible, setProfessionalCreateModalVisible] = useState(false);
  const [questionsModalVisible, setQuestionsModalVisible] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQuestionModalVisible, setEditQuestionModalVisible] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("consumer");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formCountry, setFormCountry] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Admin creation form states
  const [adminFormName, setAdminFormName] = useState("");
  const [adminFormEmail, setAdminFormEmail] = useState("");
  const [adminFormPassword, setAdminFormPassword] = useState("");
  const [adminFormConfirmPassword, setAdminFormConfirmPassword] = useState("");
  const [adminFormLoading, setAdminFormLoading] = useState(false);

  // Professional creation form states
  const [profFormName, setProfFormName] = useState("");
  const [profFormEmail, setProfFormEmail] = useState("");
  const [profFormPassword, setProfFormPassword] = useState("");
  const [profFormConfirmPassword, setProfFormConfirmPassword] = useState("");
  const [profFormRole, setProfFormRole] = useState("biologist");
  const [profFormLoading, setProfFormLoading] = useState(false);

  // Edit question form states
  const [editQTitle, setEditQTitle] = useState("");
  const [editQCategory, setEditQCategory] = useState("");
  const [editQOptions, setEditQOptions] = useState("");

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      if (!token) {
        Alert.alert("Erreur", "Vous n'êtes pas authentifié");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/users`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        await AsyncStorage.removeItem("auth_token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        const transformedUsers = data.map(user => ({
          id: user.id || user._id || "",
          name: user.fullname || user.name || "Unknown",
          email: user.email || "",
          role: user.role || "consumer",
          status: "active",
          createdAt: user.dateinscription || user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin || "N/A",
          phone: user.phone || "",
          country: user.country || "",
        }));
        setUsers(transformedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Erreur", "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/users/stats`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Replace the loadQuestions function
const loadQuestions = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) return;

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
        // If no questions in DB, seed with defaults
        await seedDefaultQuestions();
      }
    } else {
      // If endpoint fails, use defaults
      setQuestions(DEFAULT_QUESTIONS);
    }
  } catch (error) {
    console.error("Error loading questions:", error);
    setQuestions(DEFAULT_QUESTIONS);
  }
};

// Add seed function
const seedDefaultQuestions = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/api/questions`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(DEFAULT_QUESTIONS),
    });
    if (response.ok) {
      const data = await response.json();
      setQuestions(data);
    } else {
      setQuestions(DEFAULT_QUESTIONS);
    }
  } catch (error) {
    console.error("Error seeding questions:", error);
    setQuestions(DEFAULT_QUESTIONS);
  }
};


  // Replace saveQuestions function
const saveQuestions = async (updatedQuestions: Question[]) => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      Alert.alert("Erreur", "Vous n'êtes pas authentifié");
      return;
    }

    // Save each question individually
    let success = true;
    for (const question of updatedQuestions) {
      const response = await fetch(`${API_URL}/api/questions/${question.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: question.category,
          title: question.title,
          options: question.options,
        }),
      });
      if (!response.ok) {
        success = false;
        break;
      }
    }

    if (success) {
      setQuestions(updatedQuestions);
      Alert.alert("Succès", "Questions mises à jour avec succès !");
    } else {
      Alert.alert("Erreur", "Impossible de sauvegarder les modifications");
      // Reload to get latest state
      await loadQuestions();
    }
  } catch (error) {
    console.error("Error saving questions:", error);
    Alert.alert("Erreur", "Impossible de sauvegarder les modifications");
  }
};

  useEffect(() => {
    fetchUsers();
    fetchStats();
    loadQuestions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
    fetchStats();
    loadQuestions();
  };

  // Filter users with null checking
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const userName = (user.name || "").toLowerCase();
    const userEmail = (user.email || "").toLowerCase();
    const matchesSearch = userName.includes(searchLower) || userEmail.includes(searchLower);
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const inactiveUsers = users.filter((u) => u.status === "inactive").length;
  
  const roleCounts = {
    admin: users.filter((u) => u.role === "admin").length,
    biologist: users.filter((u) => u.role === "biologist").length,
    nutritionist: users.filter((u) => u.role === "nutritionist").length,
    distributor: users.filter((u) => u.role === "distributor").length,
    consumer: users.filter((u) => u.role === "consumer").length,
  };

  const handleCreateUser = async () => {
    if (!formName || !formEmail || !formPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    if (formPassword !== formConfirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }
    if (formPassword.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setFormLoading(true);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: formName,
          email: formEmail,
          motdepasse: formPassword,
          role: formRole,
        }),
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        await AsyncStorage.removeItem("auth_token");
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la création");
      }

      await fetchUsers();
      await fetchStats();
      setCreateModalVisible(false);
      resetForm();
      Alert.alert("Succès", `Utilisateur ${formName} créé avec succès`);
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminFormName || !adminFormEmail || !adminFormPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    if (adminFormPassword !== adminFormConfirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }
    if (adminFormPassword.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setAdminFormLoading(true);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: adminFormName,
          email: adminFormEmail,
          motdepasse: adminFormPassword,
          role: "admin",
        }),
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        await AsyncStorage.removeItem("auth_token");
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la création de l'administrateur");
      }

      await fetchUsers();
      await fetchStats();
      setAdminCreateModalVisible(false);
      resetAdminForm();
      Alert.alert("Succès", `Administrateur ${adminFormName} créé avec succès`);
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setAdminFormLoading(false);
    }
  };

  const handleCreateProfessional = async () => {
    if (!profFormName || !profFormEmail || !profFormPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    if (profFormPassword !== profFormConfirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }
    if (profFormPassword.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setProfFormLoading(true);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: profFormName,
          email: profFormEmail,
          motdepasse: profFormPassword,
          role: profFormRole,
        }),
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        await AsyncStorage.removeItem("auth_token");
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la création du professionnel");
      }

      await fetchUsers();
      await fetchStats();
      setProfessionalCreateModalVisible(false);
      resetProfForm();
      Alert.alert("Succès", `${getRoleName(profFormRole)} ${profFormName} créé avec succès`);
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setProfFormLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setFormLoading(true);

    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname: formName,
          email: formEmail,
          role: formRole,
          phone: formPhone,
          country: formCountry,
        }),
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        await AsyncStorage.removeItem("auth_token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la modification");
      }

      await fetchUsers();
      setEditModalVisible(false);
      resetForm();
      Alert.alert("Succès", `Utilisateur ${formName} modifié avec succès`);
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert("Confirmation", `Voulez-vous vraiment supprimer ${user.name} ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("auth_token");
            
            const response = await fetch(`${API_URL}/api/users/${user.id}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.status === 401) {
              Alert.alert("Session expirée", "Veuillez vous reconnecter");
              await AsyncStorage.removeItem("auth_token");
              router.replace("/login");
              return;
            }

            if (!response.ok) {
              throw new Error("Erreur lors de la suppression");
            }

            await fetchUsers();
            await fetchStats();
            Alert.alert("Succès", `Utilisateur ${user.name} supprimé`);
          } catch (error: any) {
            Alert.alert("Erreur", error.message);
          }
        },
      },
    ]);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name || "");
    setFormEmail(user.email || "");
    setFormRole(user.role || "consumer");
    setFormPhone(user.phone || "");
    setFormCountry(user.country || "");
    setEditModalVisible(true);
  };

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormConfirmPassword("");
    setFormRole("consumer");
    setFormPhone("");
    setFormCountry("");
    setSelectedUser(null);
  };

  const resetAdminForm = () => {
    setAdminFormName("");
    setAdminFormEmail("");
    setAdminFormPassword("");
    setAdminFormConfirmPassword("");
  };

  const resetProfForm = () => {
    setProfFormName("");
    setProfFormEmail("");
    setProfFormPassword("");
    setProfFormConfirmPassword("");
    setProfFormRole("biologist");
  };

  const getRoleIcon = (role: string) => USER_ROLES.find((r) => r.id === role)?.icon || "person-outline";
  const getRoleColor = (role: string) => USER_ROLES.find((r) => r.id === role)?.color || COLORS.textTertiary;
  const getRoleName = (role: string) => USER_ROLES.find((r) => r.id === role)?.name || role;

  const openQuestionEditor = (question: Question) => {
    setEditingQuestion(question);
    setEditQTitle(question.title);
    setEditQCategory(question.category);
    setEditQOptions(question.options.map(o => o.label).join('\n'));
    setEditQuestionModalVisible(true);
  };

  // Replace the saveQuestionChanges function
const saveQuestionChanges = async () => {
  if (!editingQuestion) return;
  if (!editQTitle.trim()) {
    Alert.alert("Erreur", "Veuillez entrer un titre pour la question");
    return;
  }
  if (!editQCategory.trim()) {
    Alert.alert("Erreur", "Veuillez entrer une catégorie");
    return;
  }
  if (!editQOptions.trim()) {
    Alert.alert("Erreur", "Veuillez entrer au moins une option");
    return;
  }

  const optionsList = editQOptions.split('\n').filter(o => o.trim().length > 0);
  if (optionsList.length < 2) {
    Alert.alert("Erreur", "Veuillez entrer au moins 2 options");
    return;
  }

  const updatedQuestion = {
    ...editingQuestion,
    title: editQTitle.trim(),
    category: editQCategory.trim(),
    options: optionsList.map((label, index) => ({
      id: `opt_${index}_${Date.now()}`,
      label: label.trim(),
    })),
  };

  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
      Alert.alert("Erreur", "Vous n'êtes pas authentifié");
      return;
    }

    const response = await fetch(`${API_URL}/api/questions/${editingQuestion.id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: updatedQuestion.category,
        title: updatedQuestion.title,
        options: updatedQuestion.options,
      }),
    });

    if (response.ok) {
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id ? updatedQuestion : q
      );
      setQuestions(updatedQuestions);
      setEditQuestionModalVisible(false);
      setEditingQuestion(null);
      Alert.alert("Succès", "Question mise à jour avec succès !");
    } else {
      Alert.alert("Erreur", "Impossible de mettre à jour la question");
    }
  } catch (error) {
    console.error("Error saving question:", error);
    Alert.alert("Erreur", "Impossible de mettre à jour la question");
  }
};


  const renderQuestionItem = ({ item }: { item: Question }) => (
    <TouchableOpacity 
      style={styles.questionCard} 
      onPress={() => openQuestionEditor(item)}
      activeOpacity={0.7}
    >
      <View style={styles.questionCardHeader}>
        <View style={styles.questionBadge}>
          <Text style={styles.questionBadgeText}>{item.id.toUpperCase()}</Text>
        </View>
        <View style={[styles.questionTypeBadge, { backgroundColor: item.type === 'single' ? COLORS.info + '20' : COLORS.warning + '20' }]}>
          <Text style={[styles.questionTypeText, { color: item.type === 'single' ? COLORS.info : COLORS.warning }]}>
            {item.type === 'single' ? 'Choix unique' : 'Choix multiple'}
          </Text>
        </View>
      </View>
      <Text style={styles.questionTitleText} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.questionCategoryText}>Catégorie: {item.category}</Text>
      <Text style={styles.questionOptionsCount}>{item.options.length} options</Text>
    </TouchableOpacity>
  );

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => openEditModal(item)} activeOpacity={0.7}>
      <View style={styles.userCardLeft}>
        <View style={[styles.userAvatar, { backgroundColor: getRoleColor(item.role) + "20" }]}>
          <Ionicons name={getRoleIcon(item.role) as any} size={24} color={getRoleColor(item.role)} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || "Unknown"}</Text>
          <Text style={styles.userEmail}>{item.email || "No email"}</Text>
          <View style={styles.userMeta}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + "20" }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>{getRoleName(item.role)}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.userCardRight}>
        <TouchableOpacity onPress={() => handleDeleteUser(item)} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.header}>
          
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <TouchableOpacity style={styles.statCard} onPress={() => setStatsModalVisible(true)}>
            <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
            <Text style={styles.statLabel}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} onPress={() => setProfessionalCreateModalVisible(true)}>
            <Ionicons name="person-add-outline" size={24} color={COLORS.success} />
            <Text style={styles.statLabel}>Pro+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} onPress={() => setQuestionsModalVisible(true)}>
            <Ionicons name="list-outline" size={24} color={COLORS.warning} />
            <Text style={styles.statLabel}>Questions</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity style={[styles.filterChip, selectedRole === "all" && styles.filterChipActive]} onPress={() => setSelectedRole("all")}>
            <Text style={[styles.filterText, selectedRole === "all" && styles.filterTextActive]}>Tous ({totalUsers})</Text>
          </TouchableOpacity>
          {USER_ROLES.map((role) => (
            <TouchableOpacity key={role.id} style={[styles.filterChip, selectedRole === role.id && styles.filterChipActive]} onPress={() => setSelectedRole(role.id)}>
              <Ionicons name={role.icon as any} size={14} color={selectedRole === role.id ? "#fff" : COLORS.textSecondary} />
              <Text style={[styles.filterText, selectedRole === role.id && styles.filterTextActive]}>{role.name} ({roleCounts[role.id as keyof typeof roleCounts] || 0})</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textTertiary} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Rechercher un utilisateur..." 
            value={searchQuery} 
            onChangeText={setSearchQuery} 
            placeholderTextColor={COLORS.textTertiary}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id || Math.random().toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.usersList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
            </View>
          }
        />
      </ScrollView>

      {/* Create User Modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent={false} onRequestClose={() => setCreateModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Créer un utilisateur</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom complet *</Text>
              <TextInput 
                style={styles.input} 
                value={formName} 
                onChangeText={setFormName} 
                placeholder="Ex: Ahmed Ben Ali"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput 
                style={styles.input} 
                value={formEmail} 
                onChangeText={setFormEmail} 
                placeholder="Ex: user@microvita.com" 
                keyboardType="email-address" 
                autoCapitalize="none"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe *</Text>
              <TextInput 
                style={styles.input} 
                value={formPassword} 
                onChangeText={setFormPassword} 
                placeholder="Min 6 caractères" 
                secureTextEntry
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe *</Text>
              <TextInput 
                style={styles.input} 
                value={formConfirmPassword} 
                onChangeText={setFormConfirmPassword} 
                placeholder="Confirmer" 
                secureTextEntry
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rôle</Text>
              <View style={styles.roleSelector}>
                {USER_ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[styles.roleOption, formRole === role.id && styles.roleOptionActive]}
                    onPress={() => setFormRole(role.id)}
                  >
                    <Ionicons name={role.icon as any} size={18} color={formRole === role.id ? "#fff" : COLORS.textSecondary} />
                    <Text style={[styles.roleOptionText, formRole === role.id && styles.roleOptionTextActive]}>{role.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleCreateUser} disabled={formLoading}>
              {formLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Créer l'utilisateur</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Professional Create Modal */}
      <Modal visible={professionalCreateModalVisible} animationType="slide" transparent={false} onRequestClose={() => setProfessionalCreateModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setProfessionalCreateModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Créer un professionnel</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom complet *</Text>
              <TextInput 
                style={styles.input} 
                value={profFormName} 
                onChangeText={setProfFormName} 
                placeholder="Ex: Dr. Mohamed"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput 
                style={styles.input} 
                value={profFormEmail} 
                onChangeText={setProfFormEmail} 
                placeholder="Ex: professionnel@microvita.com" 
                keyboardType="email-address" 
                autoCapitalize="none"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mot de passe *</Text>
              <TextInput 
                style={styles.input} 
                value={profFormPassword} 
                onChangeText={setProfFormPassword} 
                placeholder="Min 6 caractères" 
                secureTextEntry
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe *</Text>
              <TextInput 
                style={styles.input} 
                value={profFormConfirmPassword} 
                onChangeText={setProfFormConfirmPassword} 
                placeholder="Confirmer" 
                secureTextEntry
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rôle professionnel *</Text>
              <View style={styles.roleSelector}>
                {PROFESSIONAL_ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[styles.roleOption, profFormRole === role.id && styles.roleOptionActive]}
                    onPress={() => setProfFormRole(role.id)}
                  >
                    <Ionicons name={role.icon as any} size={18} color={profFormRole === role.id ? "#fff" : COLORS.textSecondary} />
                    <Text style={[styles.roleOptionText, profFormRole === role.id && styles.roleOptionTextActive]}>{role.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.adminNote}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.warning} />
              <Text style={styles.adminNoteText}>
                L'utilisateur aura le rôle sélectionné avec les accès correspondants.
              </Text>
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleCreateProfessional} disabled={profFormLoading}>
              {profFormLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Créer le professionnel</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit User Modal - with role selector */}
      <Modal visible={editModalVisible} animationType="slide" transparent={false} onRequestClose={() => setEditModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier l'utilisateur</Text>
            <TouchableOpacity onPress={handleUpdateUser} disabled={formLoading}>
              {formLoading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.saveButtonText}>Enregistrer</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom complet</Text>
              <TextInput 
                style={styles.input} 
                value={formName} 
                onChangeText={setFormName} 
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput 
                style={styles.input} 
                value={formEmail} 
                onChangeText={setFormEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Téléphone</Text>
              <TextInput 
                style={styles.input} 
                value={formPhone} 
                onChangeText={setFormPhone} 
                placeholder="Téléphone" 
                keyboardType="phone-pad" 
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pays</Text>
              <TextInput 
                style={styles.input} 
                value={formCountry} 
                onChangeText={setFormCountry} 
                placeholder="Pays" 
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rôle</Text>
              <View style={styles.roleSelector}>
                {USER_ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[styles.roleOption, formRole === role.id && styles.roleOptionActive]}
                    onPress={() => setFormRole(role.id)}
                  >
                    <Ionicons name={role.icon as any} size={18} color={formRole === role.id ? "#fff" : COLORS.textSecondary} />
                    <Text style={[styles.roleOptionText, formRole === role.id && styles.roleOptionTextActive]}>{role.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Questions Modal */}
      <Modal visible={questionsModalVisible} animationType="slide" transparent={false} onRequestClose={() => setQuestionsModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setQuestionsModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Questions du questionnaire</Text>
            <TouchableOpacity onPress={() => {
              // Reset to default questions
              Alert.alert(
                "Réinitialiser",
                "Voulez-vous réinitialiser toutes les questions par défaut ?",
                [
                  { text: "Annuler", style: "cancel" },
                  {
                    text: "Réinitialiser",
                    onPress: async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/api/questions`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(DEFAULT_QUESTIONS),
    });
    if (response.ok) {
      const data = await response.json();
      setQuestions(data);
      Alert.alert("Succès", "Questions réinitialisées avec succès !");
    } else {
      Alert.alert("Erreur", "Impossible de réinitialiser les questions");
    }
  } catch (error) {
    console.error("Error resetting questions:", error);
    Alert.alert("Erreur", "Impossible de réinitialiser les questions");
  }
}
                  }
                ]
              );
            }}>
              <Ionicons name="refresh-outline" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={questions}
            renderItem={renderQuestionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucune question trouvée</Text>
              </View>
            }
          />

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              Appuyez sur une question pour la modifier
            </Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Question Modal */}
      <Modal visible={editQuestionModalVisible} animationType="slide" transparent={false} onRequestClose={() => setEditQuestionModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditQuestionModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier la question</Text>
            <TouchableOpacity onPress={saveQuestionChanges}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Catégorie *</Text>
              <TextInput
                style={styles.input}
                value={editQCategory}
                onChangeText={setEditQCategory}
                placeholder="Ex: Habitudes alimentaires"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Titre de la question *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editQTitle}
                onChangeText={setEditQTitle}
                placeholder="Ex: À quelle fréquence consommez-vous des fruits et légumes ?"
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Options (une ligne par option) *
                <Text style={styles.inputHint}> - Au moins 2 options</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editQOptions}
                onChangeText={setEditQOptions}
                placeholder="Jamais&#10;Rarement&#10;Parfois&#10;Souvent&#10;Toujours&#10;Autre"
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.helpText}>
                Appuyez sur Entrée pour ajouter une nouvelle option
              </Text>
            </View>

            <View style={styles.adminNote}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.warning} />
              <Text style={styles.adminNoteText}>
                Les modifications s'appliqueront à tous les utilisateurs.
              </Text>
            </View>

            {editingQuestion && (
              <View style={styles.questionTypeIndicator}>
                <Text style={styles.questionTypeIndicatorText}>
                  Type: {editingQuestion.type === 'single' ? 'Choix unique' : 'Choix multiple'}
                </Text>
                <Text style={styles.questionTypeIndicatorSubtext}>
                  (Le type ne peut pas être modifié)
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Stats Modal */}
      <Modal visible={statsModalVisible} animationType="fade" transparent onRequestClose={() => setStatsModalVisible(false)}>
        <TouchableOpacity style={styles.statsOverlay} activeOpacity={1} onPress={() => setStatsModalVisible(false)}>
          <View style={styles.statsModalContent}>
            <View style={styles.statsModalHeader}>
              <Text style={styles.statsModalTitle}>Statistiques</Text>
              <TouchableOpacity onPress={() => setStatsModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.statsList}>
              {USER_ROLES.map((role) => (
                <View key={role.id} style={styles.statsRow}>
                  <View style={styles.statsRowLeft}>
                    <Ionicons name={role.icon as any} size={20} color={role.color} />
                    <Text style={styles.statsRowLabel}>{role.name}</Text>
                  </View>
                  <Text style={styles.statsRowValue}>{roleCounts[role.id as keyof typeof roleCounts] || 0}</Text>
                </View>
              ))}
              <View style={styles.statsDivider} />
              <View style={styles.statsRow}>
                <View style={styles.statsRowLeft}>
                  <Ionicons name="close-circle" size={20} color={COLORS.danger} />
                  <Text style={styles.statsRowLabel}>Inactifs</Text>
                </View>
                <Text style={styles.statsRowValue}>{inactiveUsers}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: COLORS.background 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 14, 
    color: COLORS.textSecondary 
  },
  header: { 
    paddingHorizontal: H_PADDING, 
    paddingTop: Platform.OS === "ios" ? 20 : 20, 
    paddingBottom: 16 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: COLORS.text 
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: COLORS.textTertiary, 
    marginTop: 4 
  },
  statsContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: H_PADDING, 
    marginBottom: 20, 
    gap: 12 
  },
  statCard: { 
    flex: 1, 
    backgroundColor: COLORS.surface, 
    borderRadius: 16, 
    padding: 12, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  statNumber: { 
    fontSize: 22, 
    fontWeight: "700", 
    color: COLORS.text 
  },
  statLabel: { 
    fontSize: 11, 
    color: COLORS.textTertiary, 
    marginTop: 4 
  },
  filtersScroll: { 
    paddingHorizontal: H_PADDING, 
    marginBottom: 16 
  },
  filterChip: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.surface, 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 8, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    gap: 6 
  },
  filterChipActive: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary 
  },
  filterText: { 
    fontSize: 13, 
    color: COLORS.textSecondary 
  },
  filterTextActive: { 
    color: "#fff" 
  },
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.surface, 
    marginHorizontal: H_PADDING, 
    marginBottom: 16, 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    gap: 8 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 14, 
    color: COLORS.text 
  },
  createButton: { 
    marginHorizontal: H_PADDING, 
    marginBottom: 20, 
    borderRadius: 12, 
    overflow: "hidden" 
  },
  createButtonGradient: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 14, 
    gap: 8 
  },
  createButtonText: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#fff" 
  },
  usersList: { 
    paddingHorizontal: H_PADDING, 
    paddingBottom: 20, 
    gap: 12 
  },
  userCard: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: COLORS.surface, 
    padding: 14, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  userCardLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    flex: 1, 
    gap: 12 
  },
  userAvatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  userInfo: { 
    flex: 1 
  },
  userName: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: COLORS.text, 
    marginBottom: 2 
  },
  userEmail: { 
    fontSize: 12, 
    color: COLORS.textTertiary, 
    marginBottom: 4 
  },
  userMeta: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },
  roleBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 8 
  },
  roleText: { 
    fontSize: 10, 
    fontWeight: "500" 
  },
  userCardRight: { 
    flexDirection: "row", 
    gap: 12 
  },
  iconButton: { 
    padding: 6 
  },
  emptyContainer: { 
    alignItems: "center", 
    paddingVertical: 40 
  },
  emptyText: { 
    fontSize: 14, 
    color: COLORS.textTertiary, 
    marginTop: 12 
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  modalHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: H_PADDING, 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: COLORS.text 
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  modalContent: { 
    padding: H_PADDING 
  },
  inputGroup: { 
    marginBottom: 20 
  },
  inputLabel: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: COLORS.text, 
    marginBottom: 6 
  },
  input: { 
    backgroundColor: COLORS.surface, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    fontSize: 14, 
    color: COLORS.text 
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: "400",
  },
  roleSelector: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8 
  },
  roleOption: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.surface, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    gap: 6 
  },
  roleOptionActive: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary 
  },
  roleOptionText: { 
    fontSize: 12, 
    color: COLORS.textSecondary 
  },
  roleOptionTextActive: { 
    color: "#fff" 
  },
  submitButton: { 
    backgroundColor: COLORS.primary, 
    borderRadius: 12, 
    paddingVertical: 14, 
    alignItems: "center", 
    marginTop: 20, 
    marginBottom: 30 
  },
  submitButtonText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#fff" 
  },
  statsOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  statsModalContent: { 
    backgroundColor: COLORS.surface, 
    borderRadius: 20, 
    width: W * 0.85, 
    padding: 20 
  },
  statsModalHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 20 
  },
  statsModalTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: COLORS.text 
  },
  statsList: { 
    gap: 12 
  },
  statsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  statsRowLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 
  },
  statsRowLabel: { 
    fontSize: 14, 
    color: COLORS.text 
  },
  statsRowValue: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: COLORS.primary 
  },
  statsDivider: { 
    height: 1, 
    backgroundColor: COLORS.border, 
    marginVertical: 8 
  },
  adminNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  adminNoteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  // Question styles
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  questionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  questionBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questionBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  questionTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questionTypeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  questionTitleText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  questionCategoryText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  questionOptionsCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  questionTypeIndicator: {
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  questionTypeIndicatorText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  questionTypeIndicatorSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerNote: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerNoteText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  helpText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
});