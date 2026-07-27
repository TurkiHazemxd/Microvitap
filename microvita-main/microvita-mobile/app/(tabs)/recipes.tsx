// app/(tabs)/recipes.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, getImageUrl } from '../../src/config/api';
import { recipesApi } from "../../src/services/api.service";

const COLORS = {
  bg: "#f8f9fa",
  card: "#ffffff",
  primary: "#0b6e4f",
  primaryLight: "#e8f5e9",
  muted: "#6c757d",
  border: "#e9ecef",
  favorite: "#f59e0b",
  time: "#10B981",
  text: "#212529",
  textSecondary: "#6c757d",
  danger: "#EF4444",
  info: "#3B82F6",
  success: "#10B981",
  star: "#F59E0B",
};

const { width: W } = Dimensions.get("window");
const P = Math.min(16, W * 0.04);

type Recipe = {
  id: string;
  nom: string;
  image: any;
  time: string;
  author: string;
  ingredients: string[];
  instructions: string[];
  rating?: number;
};

// Add Recipe Modal Component
function AddRecipeModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}) {
  const [nom, setNom] = useState("");
  const [time, setTime] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission", "Nous avons besoin d'accéder à vos photos");
        return false;
      }
      return true;
    }
    return true;
  };

  const uploadBase64Image = async (base64Data: string, fileName: string): Promise<boolean> => {
    try {
      let pureBase64 = base64Data;
      if (pureBase64.includes('base64,')) {
        pureBase64 = pureBase64.split('base64,')[1];
      }
      
      const uploadResponse = await fetch(`${API_URL}/api/upload/base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: pureBase64, filename: fileName }),
      });
      
      if (!uploadResponse.ok) throw new Error('Upload failed');
      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      return false;
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      let asset = result.assets[0];
      
      if (asset.base64 && asset.base64.length > 1000000) {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.3,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          asset = result.assets[0];
        }
      }
      
      if (!asset.base64) {
        Alert.alert("Erreur", "L'image n'a pas pu être lue");
        return;
      }
      
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      setImage(asset.uri);
      setImageName(fileName);
      
      setUploading(true);
      const success = await uploadBase64Image(asset.base64, fileName);
      setUploading(false);
      
      if (!success) {
        Alert.alert("Erreur", "Impossible d'uploader l'image");
        setImage(null);
        setImageName("");
      }
    }
  };

  const handleSubmit = async () => {
    if (!nom.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom");
      return;
    }

    setLoading(true);
    try {
      const ingredientsArray = ingredients.split(",").map(i => i.trim()).filter(i => i);
      const instructionsArray = instructions.split("\n").filter(i => i.trim());
      
      const userStr = await AsyncStorage.getItem("user");
      let author = "Chef";
      if (userStr) {
        const user = JSON.parse(userStr);
        author = user.name || "Chef";
      }
      
      await onAdd({
        nom,
        time,
        author,
        ingredients: ingredientsArray,
        instructions: instructionsArray,
        image: imageName,
      });
      
      setNom("");
      setTime("");
      setIngredients("");
      setInstructions("");
      setImage(null);
      setImageName("");
      onClose();
    } catch (error) {
      console.error("Error adding recipe:", error);
      Alert.alert("Erreur", "Impossible d'ajouter la recette");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Ajouter une recette</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Ex: Salade..." />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Temps (ex: 15 min)</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="15 min" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Image</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              {image ? (
                <View>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <Text style={styles.imagePickerText}>Changer l'image</Text>
                </View>
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Ionicons name="camera-outline" size={40} color={COLORS.primary} />
                  <Text style={styles.imagePickerText}>Sélectionner une image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ingrédients (séparés par des virgules)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={ingredients} onChangeText={setIngredients} multiline numberOfLines={4} placeholder="50g de roquette, 30g de micro-pousses..." />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instructions (une ligne par étape)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={instructions} onChangeText={setInstructions} multiline numberOfLines={6} placeholder="1. Laver les micro-pousses&#10;2. Préparer la vinaigrette..." />
          </View>

          <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading || uploading}>
            {loading || uploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Ajouter</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Edit Recipe Modal Component
function EditRecipeModal({
  visible,
  recipe,
  onClose,
  onUpdate,
}: {
  visible: boolean;
  recipe: Recipe | null;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}) {
  const [nom, setNom] = useState("");
  const [time, setTime] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipe) {
      setNom(recipe.nom);
      setTime(recipe.time || "");
      setIngredients(recipe.ingredients?.join(", ") || "");
      setInstructions(recipe.instructions?.join("\n") || "");
    }
  }, [recipe]);

  const handleSubmit = async () => {
    if (!nom.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom");
      return;
    }

    setLoading(true);
    try {
      const ingredientsArray = ingredients.split(",").map(i => i.trim()).filter(i => i);
      const instructionsArray = instructions.split("\n").filter(i => i.trim());
      
      await onUpdate(recipe!.id, {
        nom,
        time,
        ingredients: ingredientsArray,
        instructions: instructionsArray,
      });
      onClose();
    } catch (error) {
      console.error("Error updating recipe:", error);
      Alert.alert("Erreur", "Impossible de modifier la recette");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Modifier la recette</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Temps</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ingrédients (séparés par des virgules)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={ingredients} onChangeText={setIngredients} multiline numberOfLines={4} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instructions (une ligne par étape)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={instructions} onChangeText={setInstructions} multiline numberOfLines={6} />
          </View>

          <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Enregistrer</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Recipe Detail Modal Component
function RecipeDetailModal({
  visible,
  recipe,
  onClose,
}: {
  visible: boolean;
  recipe: Recipe | null;
  onClose: () => void;
}) {
  if (!recipe) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onClose} style={styles.detailBackButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>Recette</Text>
          <TouchableOpacity style={styles.detailFavoriteButton}>
            <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={recipe.image} style={styles.detailImage} resizeMode="cover" />

          <View style={styles.detailInfo}>
            <View style={styles.detailNameRow}>
              <Text style={styles.detailName}>{recipe.nom}</Text>
              <View style={styles.detailTimeBadge}>
                <Ionicons name="time" size={16} color={COLORS.time} />
                <Text style={styles.detailTimeText}>{recipe.time}</Text>
              </View>
            </View>

            

            <Text style={styles.detailSectionTitle}>Ingrédients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.detailIngredientItem}>
                <Ionicons name="leaf" size={16} color={COLORS.primary} />
                <Text style={styles.detailIngredientText}>{ingredient}</Text>
              </View>
            ))}

            <Text style={styles.detailSectionTitle}>Instructions</Text>
            {recipe.instructions.map((step, index) => (
              <View key={index} style={styles.detailInstructionItem}>
                <View style={styles.detailInstructionNumber}><Text style={styles.detailInstructionNumberText}>{index + 1}</Text></View>
                <Text style={styles.detailInstructionText}>{step}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Main Recipe Screen Component
export default function RecettesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecipeForEdit, setSelectedRecipeForEdit] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const [roleLoaded, setRoleLoaded] = useState(false);

  useEffect(() => {
    loadUser();
    loadRecipes();
  }, []);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || "");
        setUserRole(user.role || "");
        console.log("User role loaded:", user.role);
      }
      setRoleLoaded(true);
    } catch (error) {
      console.error("Error loading user:", error);
      setRoleLoaded(true);
    }
  };

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const data = await recipesApi.getAll();
      
      const mappedData = data.map((item: any, index: number) => ({
        id: item.id,
        nom: item.nom,
        image: item.image ? { uri: getImageUrl(item.image) } : require("../../assets/images/tarte.png"),
        time: item.time || "",
        author: item.author || "",
        ingredients: item.ingredients || [],
        instructions: item.instructions || [],
        rating: item.rating || 4.5,
      }));
      
      setRecipes(mappedData);
    } catch (error) {
      console.error("Error loading recipes:", error);
      Alert.alert("Erreur", "Impossible de charger les recettes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = async (data: any) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${API_URL}/api/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        return;
      }

      if (!response.ok) throw new Error("Failed to add recipe");
      
      Alert.alert("Succès", "Recette ajoutée avec succès");
      loadRecipes();
    } catch (error) {
      console.error("Error adding recipe:", error);
      Alert.alert("Erreur", "Impossible d'ajouter la recette");
    }
  };

  const handleEditRecipe = async (id: string, data: any) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${API_URL}/api/recipes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        return;
      }

      if (!response.ok) throw new Error("Failed to update recipe");
      
      Alert.alert("Succès", "Recette modifiée avec succès");
      loadRecipes();
    } catch (error) {
      console.error("Error updating recipe:", error);
      Alert.alert("Erreur", "Impossible de modifier la recette");
    }
  };

  const handleDeleteRecipe = async (id: string, name: string) => {
    const token = await AsyncStorage.getItem("auth_token");
    
    if (Platform.OS === 'web') {
      if (!window.confirm(`Voulez-vous vraiment supprimer "${name}" ?`)) return;
    } else {
      return new Promise((resolve) => {
        Alert.alert("Confirmation", `Voulez-vous vraiment supprimer "${name}" ?`, [
          { text: "Annuler", style: "cancel", onPress: () => resolve(false) },
          { text: "Supprimer", style: "destructive", onPress: () => resolve(true) },
        ]);
      });
    }
    
    try {
      const response = await fetch(`${API_URL}/api/recipes/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        return;
      }

      if (response.ok) {
        Alert.alert("Succès", "Recette supprimée");
        loadRecipes();
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recipes.filter((recipe) => recipe.nom.toLowerCase().includes(q));
  }, [searchQuery, recipes]);

  // Check if user is a nutritionist (ONLY nutritionist can manage recipes)
  const isNutritionist = userRole === "nutritionist";

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`star-${i}`} name="star" size={12} color={COLORS.star} />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half-star" name="star-half" size={12} color={COLORS.star} />);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color={COLORS.star} />);
    }
    return stars;
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    
    <View style={styles.recipeCard}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => { setSelectedRecipe(item); setModalVisible(true); }}
      >
        <Image source={item.image} style={styles.recipeCardImage} />
        <View style={styles.recipeCardOverlay}>
          <View style={styles.recipeCardBadge}>
            <Ionicons name="time-outline" size={12} color="#fff" />
            <Text style={styles.recipeCardBadgeText}>{item.time}</Text>
          </View>
        </View>
        <View style={styles.recipeCardContent}>
          <Text style={styles.recipeCardTitle}>{item.nom}</Text>
          <View style={styles.recipeCardMeta}>
            <View style={styles.recipeCardRating}>
              
            </View>
            
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Edit and Delete Buttons - ONLY for Nutritionist */}
      {isNutritionist && (
        <View style={styles.cardButtons}>
          <TouchableOpacity style={[styles.cardButton, styles.editButton]} onPress={() => { setSelectedRecipeForEdit(item); setEditModalVisible(true); }}>
            <Ionicons name="create-outline" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cardButton, styles.deleteButton]} onPress={() => handleDeleteRecipe(item.id, item.nom)}>
            <Ionicons name="trash-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading || !roleLoaded) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        
      </View>

      
      <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un recette..."
                placeholderTextColor={COLORS.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== "" && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={18} color={COLORS.muted} />
                </TouchableOpacity>
              )}
            </View>
      {/* Add Button - ONLY visible for Nutritionist */}
      {isNutritionist && (
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter une recette</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.recipesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucune recette trouvée</Text>
          </View>
        }
      />

      <RecipeDetailModal visible={modalVisible} recipe={selectedRecipe} onClose={() => setModalVisible(false)} />
      
      {/* Only show Add/Edit modals if user is Nutritionist */}
      {isNutritionist && (
        <>
          <AddRecipeModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} onAdd={handleAddRecipe} />
          <EditRecipeModal visible={editModalVisible} recipe={selectedRecipeForEdit} onClose={() => setEditModalVisible(false)} onUpdate={handleEditRecipe} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerContainer: { justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: P,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginHorizontal: P,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginHorizontal: P,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  recipesList: { paddingHorizontal: P, paddingBottom: 20, gap: 16 },
  recipeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  recipeCardImage: { width: "100%", height: 250, backgroundColor: COLORS.primaryLight },
  recipeCardOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  recipeCardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  recipeCardBadgeText: { fontSize: 11, color: "#fff", fontWeight: "500" },
  recipeCardContent: { padding: 14 },
  recipeCardTitle: { fontSize: 17, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  recipeCardMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  recipeCardRating: { flexDirection: "row", alignItems: "center", gap: 2 },
  recipeCardAuthor: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "500" },
  cardButtons: { position: "absolute", top: 8, left: 8, flexDirection: "row", gap: 6 },
  cardButton: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  editButton: { backgroundColor: COLORS.info },
  deleteButton: { backgroundColor: COLORS.danger },
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 15, color: COLORS.muted, fontWeight: "500" },
  detailContainer: { flex: 1, backgroundColor: COLORS.bg },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: COLORS.bg },
  detailBackButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, alignItems: "center", justifyContent: "center", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  detailHeaderTitle: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
  detailFavoriteButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, alignItems: "center", justifyContent: "center", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  detailImage: { width: "100%", height: 250 },
  detailInfo: { padding: 20 },
  detailNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  detailName: { fontSize: 24, fontWeight: "800", color: COLORS.primary, flex: 1, marginRight: 12 },
  detailTimeBadge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  detailTimeText: { fontSize: 14, fontWeight: "600", color: COLORS.time },
  detailAuthor: { fontSize: 14, color: COLORS.primary, fontWeight: "500", fontStyle: "italic", marginBottom: 24 },
  detailSectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.primary, marginTop: 20, marginBottom: 15 },
  detailIngredientItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailIngredientText: { fontSize: 14, fontWeight: "500", color: COLORS.text, flex: 1 },
  detailInstructionItem: { flexDirection: "row", gap: 12, marginBottom: 12 },
  detailInstructionNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  detailInstructionNumberText: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  detailInstructionText: { flex: 1, fontSize: 14, lineHeight: 20, color: COLORS.text, fontWeight: "500" },
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  modalContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "500", color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  imagePickerButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, overflow: 'hidden', backgroundColor: COLORS.card },
  imagePickerPlaceholder: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  imagePickerText: { fontSize: 14, color: COLORS.primary, marginTop: 10, textAlign: 'center' },
  previewImage: { width: '100%', height: 200, resizeMode: 'cover' },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 10, marginBottom: 30 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});