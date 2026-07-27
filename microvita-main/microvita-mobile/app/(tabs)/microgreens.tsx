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
import { microgreensApi } from "../../src/services/api.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, getImageUrl } from '../../src/config/api';


const COLORS = {
  bg: "#f6f7f6",
  card: "#ffffff",
  primary: "#0b6e4f",
  primaryLight: "#dff2e6",
  secondary: "#F59E0B",
  secondaryLight: "#FEF3C7",
  muted: "#6b7280",
  border: "rgba(0,0,0,0.08)",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
  vitaminA: "#F97316",
  vitaminC: "#10B981",
  vitaminK: "#8B5CF6",
  iron: "#EC4899",
  favorite: "#F59E0B",
  text: "#1F2937",
  textSecondary: "#6b7280",
};

const { width: W } = Dimensions.get("window");
const P = Math.min(16, W * 0.04);

type DistributionChannel = {
  id: string;
  name: string;
  rating: number;
  image: any;
  description: string;
  products: string[];
  minOrder: string;
  deliveryTime: string;
  type?: string;
  contact: { phone: string; email: string; website?: string };
  openingHours: { day: string; hours: string }[];
  certifications?: string[];
  additionalImages?: any[];
  scientificName?: string;
  benefits?: string[];
  taste?: string;
  dailyIntake?: { vitaminA?: string; vitaminC?: string; vitaminK?: string; iron?: string; calcium?: string };
  teneurFer?: string;
  teneurCalcium?: string;
  protéines?: string;
  glucoses?: string;
};

// ============================================================
// DETAIL MODAL COMPONENT
// ============================================================
function DistributionDetailModal({
  visible,
  channel,
  onClose,
}: {
  visible: boolean;
  channel: DistributionChannel | null;
  onClose: () => void;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!channel) return null;

  const allImages = [channel.image, ...(channel.additionalImages || [])];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.detailContainer}>
        {/* Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onClose} style={styles.detailBackButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle}>Détails</Text>
          <TouchableOpacity style={styles.detailFavoriteButton}>
            <Ionicons name="heart-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Main Image */}
          <View style={styles.detailImageContainer}>
            <Image source={allImages[currentImageIndex]} style={styles.detailImage} resizeMode="cover" />
          </View>

          {/* Thumbnails */}
          <View style={styles.detailThumbnailsContainer}>
            {allImages.map((img, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.detailThumbnailItem, currentImageIndex === index && styles.detailThumbnailItemActive]}
                onPress={() => setCurrentImageIndex(index)}
              >
                <Image source={img} style={styles.detailThumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Details Content */}
          <View style={styles.detailInfo}>
            <Text style={styles.detailScientificName}>{channel.scientificName || channel.type}</Text>

            <View style={styles.detailNameRow}>
              <Text style={styles.detailName}>{channel.name}</Text>
              
            </View>

            <Text style={styles.detailDescription}>{channel.description}</Text>

            {/* Taste Section */}
            {channel.taste && (
              <View style={styles.detailTasteSection}>
                <Text style={styles.detailSectionTitle}>Goût</Text>
                <Text style={styles.detailTasteText}>{channel.taste}</Text>
              </View>
            )}

            {/* Benefits Section */}
            {channel.benefits && channel.benefits.length > 0 && (
              <>
                <Text style={styles.detailSectionTitle}>Bienfaits</Text>
                <View style={styles.detailBenefitsGrid}>
                  {channel.benefits.map((benefit, index) => (
                    <View key={index} style={styles.detailBenefitChip}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                      <Text style={styles.detailBenefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Nutritional Information */}
            {(channel.teneurFer || channel.teneurCalcium || channel.protéines || channel.glucoses) && (
              <>
                <Text style={styles.detailSectionTitle}>Valeurs nutritionnelles</Text>
                <View style={styles.nutritionGrid}>
                  {channel.teneurFer && (
                    <View style={styles.nutritionCard}>
                      <Ionicons name="flask-outline" size={24} color={COLORS.iron} />
                      <Text style={styles.nutritionValue}>{channel.teneurFer}</Text>
                      <Text style={styles.nutritionLabel}>Fer</Text>
                    </View>
                  )}
                  {channel.teneurCalcium && (
                    <View style={styles.nutritionCard}>
                      <Ionicons name="leaf-outline" size={24} color={COLORS.vitaminC} />
                      <Text style={styles.nutritionValue}>{channel.teneurCalcium}</Text>
                      <Text style={styles.nutritionLabel}>Calcium</Text>
                    </View>
                  )}
                  {channel.protéines && (
                    <View style={styles.nutritionCard}>
                      <Ionicons name="fitness-outline" size={24} color={COLORS.vitaminA} />
                      <Text style={styles.nutritionValue}>{channel.protéines}</Text>
                      <Text style={styles.nutritionLabel}>Protéines</Text>
                    </View>
                  )}
                  {channel.glucoses && (
                    <View style={styles.nutritionCard}>
                      <Ionicons name="flash-outline" size={24} color={COLORS.warning} />
                      <Text style={styles.nutritionValue}>{channel.glucoses}</Text>
                      <Text style={styles.nutritionLabel}>Glucides</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ============================================================
// EDIT MICROGREEN MODAL COMPONENT
// ============================================================
function EditMicrogreenModal({
  visible,
  microgreen,
  onClose,
  onUpdate,
}: {
  visible: boolean;
  microgreen: DistributionChannel | null;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}) {
  // Form state
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [gout, setGout] = useState("");
  const [bienfaits, setBienfaits] = useState("");
  const [teneurFer, setTeneurFer] = useState("");
  const [teneurCalcium, setTeneurCalcium] = useState("");
  const [proteines, setProteines] = useState("");
  const [glucoses, setGlucoses] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form when microgreen changes
  useEffect(() => {
    if (microgreen) {
      setNom(microgreen.name);
      setDescription(microgreen.description);
      setGout(microgreen.taste || "");
      setBienfaits(microgreen.benefits?.join(", ") || "");
      setTeneurFer(microgreen.teneurFer || "");
      setTeneurCalcium(microgreen.teneurCalcium || "");
      setProteines(microgreen.protéines || "");
      setGlucoses(microgreen.glucoses || "");
    }
  }, [microgreen]);

  const handleSubmit = async () => {
    if (!nom.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom");
      return;
    }

    setLoading(true);
    try {
      const bienfaitsArray = bienfaits.split(",").map(b => b.trim()).filter(b => b);
      
      await onUpdate(microgreen!.id, {
        nom, description, gout,
        bienfaits: bienfaitsArray,
        teneurFer, teneurCalcium,
        protéines: proteines, glucoses,
      });
      
      onClose();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de modifier la micro-pousse");
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
          <Text style={styles.modalTitle}>Modifier la micro-pousse</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Basic Information */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Ex: Brocoli" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Description..." multiline numberOfLines={4} textAlignVertical="top" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Goût</Text>
            <TextInput style={styles.input} value={gout} onChangeText={setGout} placeholder="Ex: Doux, légèrement amer" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bienfaits (séparés par des virgules)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={bienfaits} onChangeText={setBienfaits} placeholder="Ex: Anti-inflammatoire, Détoxifiant" multiline numberOfLines={3} textAlignVertical="top" />
          </View>

          {/* Nutritional Values */}
          <Text style={styles.sectionSubtitle}>Valeurs nutritionnelles</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teneur en Fer (mg/100g)</Text>
            <TextInput style={styles.input} value={teneurFer} onChangeText={setTeneurFer} placeholder="Ex: 2.5 mg" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teneur en Calcium (mg/100g)</Text>
            <TextInput style={styles.input} value={teneurCalcium} onChangeText={setTeneurCalcium} placeholder="Ex: 150 mg" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Protéines (g/100g)</Text>
            <TextInput style={styles.input} value={proteines} onChangeText={setProteines} placeholder="Ex: 4.5 g" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Glucides (g/100g)</Text>
            <TextInput style={styles.input} value={glucoses} onChangeText={setGlucoses} placeholder="Ex: 12 g" />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Enregistrer</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ============================================================
// ADD MICROGREEN MODAL COMPONENT
// ============================================================
function AddMicrogreenModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}) {
  // Form state
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [gout, setGout] = useState("");
  const [bienfaits, setBienfaits] = useState("");
  const [teneurFer, setTeneurFer] = useState("");
  const [teneurCalcium, setTeneurCalcium] = useState("");
  const [proteines, setProteines] = useState("");
  const [glucoses, setGlucoses] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [additionalImageNames, setAdditionalImageNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Helper: Request permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission", "Nous avons besoin d'accéder à vos photos pour ajouter des images");
        return false;
      }
      return true;
    }
    return true;
  };

  // Helper: Upload base64 image to backend
  const uploadBase64Image = async (base64Data: string, fileName: string): Promise<boolean> => {
    try {
      let pureBase64 = base64Data;
      if (pureBase64.includes('base64,')) pureBase64 = pureBase64.split('base64,')[1];
      
      const response = await fetch(`${API_URL}/api/upload/base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: pureBase64, filename: fileName }),
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Pick main image
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
      
      // Compress if too large
      if (asset.base64 && asset.base64.length > 1000000) {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.3,
          base64: true,
        });
        if (!result.canceled && result.assets && result.assets[0]) asset = result.assets[0];
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

  // Pick additional images
  const pickAdditionalImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      const newImages = [...additionalImages];
      const newNames = [...additionalImageNames];
      
      for (const asset of result.assets) {
        if (!asset.base64) continue;
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        newImages.push(asset.uri);
        newNames.push(fileName);
        await uploadBase64Image(asset.base64, fileName);
      }
      
      setAdditionalImages(newImages);
      setAdditionalImageNames(newNames);
      setUploading(false);
    }
  };

  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImageNames(prev => prev.filter((_, i) => i !== index));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!nom.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom");
      return;
    }
    if (!imageName) {
      Alert.alert("Erreur", "Veuillez sélectionner une image");
      return;
    }

    setLoading(true);
    try {
      const bienfaitsArray = bienfaits.split(",").map(b => b.trim()).filter(b => b);
      
      await onAdd({
        nom, description, gout, bienfaits: bienfaitsArray,
        image: imageName, additionalImages: additionalImageNames,
        teneurFer, teneurCalcium, protéines: proteines, glucoses,
      });
      
      // Reset form
      setNom(""); setDescription(""); setGout(""); setBienfaits("");
      setTeneurFer(""); setTeneurCalcium(""); setProteines(""); setGlucoses("");
      setImage(null); setImageName("");
      setAdditionalImages([]); setAdditionalImageNames([]);
      onClose();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter la micro-pousse");
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
          <Text style={styles.modalTitle}>Ajouter une micro-pousse</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Basic Information */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Ex: Brocoli" />
          </View>

          {/* Main Image Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Image principale *</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              {image ? (
                <View>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <Text style={styles.imagePickerText}>Changer l'image</Text>
                </View>
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Ionicons name="camera-outline" size={40} color={COLORS.primary} />
                  <Text style={styles.imagePickerText}>Toucher pour sélectionner une image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Additional Images Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Images supplémentaires</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickAdditionalImages}>
              <View style={styles.imagePickerPlaceholder}>
                <Ionicons name="images-outline" size={40} color={COLORS.primary} />
                <Text style={styles.imagePickerText}>Ajouter des images</Text>
              </View>
            </TouchableOpacity>
            
            {additionalImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.additionalImagesPreview}>
                {additionalImages.map((img, index) => (
                  <View key={index} style={styles.previewImageContainer}>
                    <Image source={{ uri: img }} style={styles.previewSmallImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeAdditionalImage(index)}>
                      <Ionicons name="close-circle" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Description..." multiline numberOfLines={4} textAlignVertical="top" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Goût</Text>
            <TextInput style={styles.input} value={gout} onChangeText={setGout} placeholder="Ex: Doux, légèrement amer" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bienfaits (séparés par des virgules)</Text>
            <TextInput style={[styles.input, styles.textArea]} value={bienfaits} onChangeText={setBienfaits} placeholder="Ex: Anti-inflammatoire, Détoxifiant" multiline numberOfLines={3} textAlignVertical="top" />
          </View>

          {/* Nutritional Values */}
          <Text style={styles.sectionSubtitle}>Valeurs nutritionnelles</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teneur en Fer (mg/100g)</Text>
            <TextInput style={styles.input} value={teneurFer} onChangeText={setTeneurFer} placeholder="Ex: 2.5 mg" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teneur en Calcium (mg/100g)</Text>
            <TextInput style={styles.input} value={teneurCalcium} onChangeText={setTeneurCalcium} placeholder="Ex: 150 mg" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Protéines (g/100g)</Text>
            <TextInput style={styles.input} value={proteines} onChangeText={setProteines} placeholder="Ex: 4.5 g" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Glucides (g/100g)</Text>
            <TextInput style={styles.input} value={glucoses} onChangeText={setGlucoses} placeholder="Ex: 12 g" />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={[styles.submitButton, (loading || uploading) && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading || uploading}>
            {(loading || uploading) ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Ajouter</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MicrogreensScreen() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [channels, setChannels] = useState<DistributionChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<DistributionChannel | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMicrogreen, setSelectedMicrogreen] = useState<DistributionChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [roleLoaded, setRoleLoaded] = useState(false);

  // ===== DATA LOADING FUNCTIONS =====
  
  // Load user role from storage
  const loadUserRole = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      }
      setRoleLoaded(true);
    } catch (error) {
      console.error("Error loading user role:", error);
      setRoleLoaded(true);
    }
  };

  // Load microgreens from API
  const loadMicrogreens = async () => {
    setLoading(true);
    try {
      const data = await microgreensApi.getAll();
      
      const mappedData = data.map((item: any) => ({
        id: item.id,
        name: item.nom,
        
        image: item.image ? { uri: getImageUrl(item.image) } : require("../../assets/images/broc1.png"),
        description: item.description || "Description à venir",
        products: ["Micro-pousses"],
        minOrder: "10 €",
        deliveryTime: "24h",
        type: "",
        contact: { phone: "", email: "" },
        
        certifications: [],
        additionalImages: item.additionalImages?.map((img: string) => ({ uri: getImageUrl(img) })) || [],
        scientificName: "",
        benefits: item.bienfaits || [],
        taste: item.gout || "",
        dailyIntake: { iron: "", calcium: "" },
        teneurFer: item.teneurFer || "",
        teneurCalcium: item.teneurCalcium || "",
        protéines: item.protéines || "",
        glucoses: item.glucoses || "",
      }));
      
      setChannels(mappedData);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les micro-pousses");
    } finally {
      setLoading(false);
    }
  };

  // ===== CRUD OPERATIONS =====
  
  // Add new microgreen
  const handleAddMicrogreen = async (data: any) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const response = await fetch(`${API_URL}/api/microgreens`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        return;
      }
      if (!response.ok) throw new Error("Failed to add microgreen");

      Alert.alert("Succès", "Micro-pousse ajoutée avec succès");
      loadMicrogreens();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter la micro-pousse");
      throw error;
    }
  };

  // Edit microgreen
  const handleEditMicrogreen = async (id: string, data: any) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const updateData = {
        nom: data.nom, description: data.description, gout: data.gout,
        bienfaits: data.bienfaits, teneurFer: data.teneurFer,
        teneurCalcium: data.teneurCalcium, protéines: data.protéines, glucoses: data.glucoses,
      };
      
      const response = await fetch(`${API_URL}/api/microgreens/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(updateData),
      });
      
      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        return;
      }
      if (response.status === 404) {
        Alert.alert("Erreur", "Micro-pousse non trouvée");
        return;
      }
      if (!response.ok) throw new Error("Failed to update");

      Alert.alert("Succès", "Micro-pousse modifiée avec succès");
      loadMicrogreens();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de modifier la micro-pousse");
    }
  };

  // Delete microgreen
  const handleDeleteMicrogreen = async (id: string, name: string) => {
    const token = await AsyncStorage.getItem("auth_token");
    
    // Web: delete immediately
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(`${API_URL}/api/microgreens/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        });
        
        if (response.status === 401) {
          Alert.alert("Session expirée", "Veuillez vous reconnecter");
          return;
        }
        if (response.ok) {
          Alert.alert("Succès", "Micro-pousse supprimée");
          loadMicrogreens();
        } else {
          Alert.alert("Erreur", "Impossible de supprimer");
        }
      } catch (error) {
        Alert.alert("Erreur", "Erreur réseau");
      }
      return;
    }
    
    // Mobile: confirm first
    Alert.alert("Confirmation", `Voulez-vous vraiment supprimer "${name}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/api/microgreens/${id}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });
            
            if (response.status === 401) {
              Alert.alert("Session expirée", "Veuillez vous reconnecter");
              return;
            }
            if (response.ok) {
              Alert.alert("Succès", "Micro-pousse supprimée");
              loadMicrogreens();
            } else {
              Alert.alert("Erreur", "Impossible de supprimer");
            }
          } catch (error) {
            Alert.alert("Erreur", "Erreur réseau");
          }
        },
      },
    ]);
  };

  // ===== HELPER FUNCTIONS =====
  
  // Filter channels based on search
  const filteredChannels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return channels.filter((channel) => !q || channel.name.toLowerCase().includes(q));
  }, [searchQuery, channels]);

  // Open detail modal
  const handleChannelPress = (channel: DistributionChannel) => {
    setSelectedChannel(channel);
    setModalVisible(true);
  };

  // ===== RENDER FUNCTIONS =====
  
  // Render channel card
  const renderChannelCard = ({ item }: { item: DistributionChannel }) => {
    const isBiologistUser = userRole === "biologist";
    
    return (
      <View style={styles.channelCard}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleChannelPress(item)}>
          <Image source={item.image} style={styles.channelImage} />
          <View style={styles.channelContent}>
            <Text style={styles.channelName} numberOfLines={1}>{item.name}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Edit/Delete buttons - Biologist only */}
        {isBiologistUser && (
          <View style={styles.cardButtons}>
            <TouchableOpacity style={[styles.cardButton, styles.editButton]} onPress={() => {
              setSelectedMicrogreen(item);
              setEditModalVisible(true);
            }}>
              <Ionicons name="create-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardButton, styles.deleteButton]} onPress={() => handleDeleteMicrogreen(item.id, item.name)}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ===== EFFECTS =====
  
  useEffect(() => {
    loadUserRole();
  }, []);

  useEffect(() => {
    loadMicrogreens();
  }, []);

  // ===== LOADING STATE =====
  if (loading || !roleLoaded) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isBiologistUser = userRole === "biologist";

  // ===== MAIN RENDER =====
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une micro-pousse..."
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

      {/* Add Button - Biologist only */}
      {isBiologistUser && (
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter une micro-pousse</Text>
        </TouchableOpacity>
      )}

      {/* Channels Grid */}
      <FlatList
        data={filteredChannels}
        renderItem={renderChannelCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.channelsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucune micro-pousse trouvée</Text>
          </View>
        }
      />

      {/* Modals */}
      <DistributionDetailModal
        visible={modalVisible}
        channel={selectedChannel}
        onClose={() => setModalVisible(false)}
      />

      {isBiologistUser && (
        <>
          <AddMicrogreenModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} onAdd={handleAddMicrogreen} />
          <EditMicrogreenModal visible={editModalVisible} microgreen={selectedMicrogreen} onClose={() => setEditModalVisible(false)} onUpdate={handleEditMicrogreen} />
        </>
      )}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerContainer: { justifyContent: "center", alignItems: "center" },
  
  // Search Bar
  searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card,
    marginHorizontal: P, marginTop: 15, marginBottom: 10,
    paddingHorizontal: 15, height: 45, borderRadius: 25,
    borderWidth: 1, borderColor: COLORS.border, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  
  // Add Button
  addButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: COLORS.primary, marginHorizontal: P, marginBottom: 10,
    paddingVertical: 12, borderRadius: 25, gap: 8,
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  
  // Channels Grid
  channelsList: { paddingHorizontal: P, paddingBottom: 20 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  channelCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 20, overflow: "hidden",
    borderWidth: 1, borderColor: COLORS.border, position: "relative",
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  channelImage: { width: "100%", height: 120, backgroundColor: COLORS.primaryLight },
  channelContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 10 },
  channelName: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  
  // Card Buttons
  cardButtons: { position: "absolute", top: 8, right: 8, flexDirection: "row", gap: 6 },
  cardButton: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  editButton: { backgroundColor: COLORS.info },
  deleteButton: { backgroundColor: COLORS.danger },
  
  // Empty State
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 50 },
  emptyText: { marginTop: 10, fontSize: 14, color: COLORS.muted, fontWeight: "600" },
  
  // Detail Modal
  detailContainer: { flex: 1, backgroundColor: COLORS.bg },
  detailHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: COLORS.bg,
  },
  detailBackButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card,
    alignItems: "center", justifyContent: "center", elevation: 2,
  },
  detailHeaderTitle: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
  detailFavoriteButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card,
    alignItems: "center", justifyContent: "center", elevation: 2,
  },
  detailImageContainer: { width: "100%", height: 250, backgroundColor: "#f0f0f0" },
  detailImage: { width: "100%", height: "100%" },
  detailThumbnailsContainer: {
    flexDirection: "row", justifyContent: "center", gap: 12,
    paddingHorizontal: 20, marginTop: 15, marginBottom: 10,
  },
  detailThumbnailItem: {
    width: 70, height: 70, borderRadius: 10, borderWidth: 2,
    borderColor: "transparent", overflow: "hidden", elevation: 2,
  },
  detailThumbnailItemActive: { borderColor: COLORS.primary },
  detailThumbnailImage: { width: "100%", height: "100%" },
  detailInfo: { padding: 20 },
  detailScientificName: { fontSize: 16, color: COLORS.primary, fontWeight: "500", fontStyle: "italic", marginBottom: 5 },
  detailNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  detailName: { fontSize: 24, fontWeight: "800", color: COLORS.primary, flex: 1, marginRight: 12 },
  detailRating: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.secondaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  detailRatingText: { fontSize: 12, fontWeight: "700", color: COLORS.secondary },
  detailDescription: { fontSize: 14, lineHeight: 20, color: COLORS.text, marginBottom: 20 },
  detailTasteSection: { marginBottom: 20 },
  detailSectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.primary, marginTop: 20, marginBottom: 15 },
  detailTasteText: { fontSize: 15, color: COLORS.text, fontStyle: "italic" },
  detailBenefitsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  detailBenefitChip: {
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 25, gap: 6,
  },
  detailBenefitText: { fontSize: 13, fontWeight: "500", color: COLORS.primary },
  
  // Nutrition Grid
  nutritionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 15, marginBottom: 20 },
  nutritionCard: {
    flex: 1, minWidth: (W - 70) / 2, backgroundColor: COLORS.card,
    borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.border,
  },
  nutritionValue: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginTop: 8 },
  nutritionLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  
  // Modals
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  modalContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "500", color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  sectionSubtitle: { fontSize: 16, fontWeight: "600", color: COLORS.primary, marginTop: 10, marginBottom: 15 },
  
  // Image Picker
  imagePickerButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, overflow: 'hidden', backgroundColor: COLORS.card },
  imagePickerPlaceholder: { padding: 30, alignItems: 'center', justifyContent: 'center' },
  imagePickerText: { fontSize: 14, color: COLORS.primary, marginTop: 10, textAlign: 'center' },
  previewImage: { width: '100%', height: 200, resizeMode: 'cover' },
  previewSmallImage: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  additionalImagesPreview: { marginTop: 10, flexDirection: 'row' },
  previewImageContainer: { position: 'relative', marginRight: 8 },
  removeImageButton: { position: 'absolute', top: -5, right: 3, backgroundColor: 'white', borderRadius: 10 },
  
  // Submit Button
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 10, marginBottom: 30 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});