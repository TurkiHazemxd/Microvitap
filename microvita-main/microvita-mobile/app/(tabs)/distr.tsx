// app/(tabs)/distr.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { distributorsApi } from "../../src/services/api.service";
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
};

interface Product {
  name: string;
  image: string;
}

interface Distributor {
  id: string;
  name: string;
  type: "Restaurant" | "Point de Vente" | "Fournisseur";
  city: string;
  phone: string;
  products: Product[];
  address?: string;
  openingHours?: string;
  deliveryAvailable?: boolean;
  minOrder?: string;
  paymentMethods?: string[];
  certifications?: string[];
}

// Product item component for display
function ProductItem({ product, onDelete }: { product: Product; onDelete: () => void }) {
  return (
    <View style={styles.productItemCard}>
      {product.image ? (
        <Image source={{ uri: getImageUrl(product.image) }} style={styles.productItemImage} />
      ) : (
        <View style={[styles.productItemImage, { backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center" }]}>
          <Ionicons name="image-outline" size={24} color={COLORS.primary} />
        </View>
      )}
      <Text style={styles.productItemName}>{product.name}</Text>
      <TouchableOpacity onPress={onDelete} style={styles.productItemDelete}>
        <Ionicons name="close-circle" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );
}

// Add Distributor Modal Component
function AddDistributorModal({ visible, onClose, onAdd }: { visible: boolean; onClose: () => void; onAdd: (data: any) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Restaurant");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [minOrder, setMinOrder] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");
  const [certifications, setCertifications] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageName, setProductImageName] = useState("");

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

  const pickProductImage = async () => {
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
      setProductImage(asset.uri);
      setProductImageName(fileName);
      
      setUploading(true);
      const success = await uploadBase64Image(asset.base64, fileName);
      setUploading(false);
      
      if (!success) {
        Alert.alert("Erreur", "Impossible d'uploader l'image");
        setProductImage(null);
        setProductImageName("");
      }
    }
  };

  const addProduct = () => {
    if (!productName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom de produit");
      return;
    }
    if (!productImageName) {
      Alert.alert("Erreur", "Veuillez sélectionner une image pour le produit");
      return;
    }

    setProducts([...products, { name: productName.trim(), image: productImageName }]);
    setProductName("");
    setProductImage(null);
    setProductImageName("");
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !city.trim() || !phone.trim()) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires (Nom, Ville, Téléphone)");
      return;
    }

    setLoading(true);
    try {
      const paymentMethodsArray = paymentMethods.split(",").map(p => p.trim()).filter(p => p);
      const certificationsArray = certifications.split(",").map(c => c.trim()).filter(c => c);
      
      await onAdd({
        name,
        type,
        city,
        phone,
        address,
        openingHours,
        deliveryAvailable,
        minOrder,
        paymentMethods: paymentMethodsArray,
        certifications: certificationsArray,
        products,
      });
      
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding distributor:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le point de vente");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setType("Restaurant");
    setCity("");
    setPhone("");
    setAddress("");
    setOpeningHours("");
    setDeliveryAvailable(false);
    setMinOrder("");
    setPaymentMethods("");
    setCertifications("");
    setProducts([]);
    setProductName("");
    setProductImage(null);
    setProductImageName("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Ajouter un point de vente</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: GreenBite Restaurant" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type *</Text>
            <View style={styles.typeSelector}>
              {["Restaurant", "Point de Vente", "Fournisseur"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeOption, type === t && styles.typeOptionActive]}
                  onPress={() => setType(t as any)}
                >
                  <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ville *</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Ex: Tunis" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+216 XX XXX XXX" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Adresse complète" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Horaires d'ouverture</Text>
            <TextInput style={styles.input} value={openingHours} onChangeText={setOpeningHours} placeholder="Ex: 10h - 22h" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Livraison disponible</Text>
            <View style={styles.switchContainer}>
              <TouchableOpacity
                style={[styles.switchOption, deliveryAvailable && styles.switchOptionActive]}
                onPress={() => setDeliveryAvailable(true)}
              >
                <Text style={[styles.switchText, deliveryAvailable && styles.switchTextActive]}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.switchOption, !deliveryAvailable && styles.switchOptionActive]}
                onPress={() => setDeliveryAvailable(false)}
              >
                <Text style={[styles.switchText, !deliveryAvailable && styles.switchTextActive]}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Commande minimale</Text>
            <TextInput style={styles.input} value={minOrder} onChangeText={setMinOrder} placeholder="Ex: 50 DT" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Moyens de paiement (séparés par des virgules)</Text>
            <TextInput style={styles.input} value={paymentMethods} onChangeText={setPaymentMethods} placeholder="Ex: Espèces, Carte" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Certifications (séparées par des virgules)</Text>
            <TextInput style={styles.input} value={certifications} onChangeText={setCertifications} placeholder="Ex: Bio, Local" />
          </View>

          {/* Products Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Produits disponibles</Text>
            
            {/* Add Product Form */}
            <View style={styles.addProductContainer}>
              <TextInput
                style={styles.productNameInput}
                value={productName}
                onChangeText={setProductName}
                placeholder="Nom du produit"
                placeholderTextColor={COLORS.muted}
              />
              <TouchableOpacity style={styles.pickImageButton} onPress={pickProductImage}>
                {productImage ? (
                  <Image source={{ uri: productImage }} style={styles.pickImagePreview} />
                ) : (
                  <View style={styles.pickImagePlaceholder}>
                    <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.pickImageText}>Image</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.addProductButton} onPress={addProduct} disabled={uploading}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Products List */}
            {products.length > 0 && (
              <View style={styles.productsList}>
                {products.map((product, index) => (
                  <ProductItem key={index} product={product} onDelete={() => removeProduct(index)} />
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading || uploading}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitButtonText}>Ajouter</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Edit Distributor Modal Component - FIXED
function EditDistributorModal({ visible, distributor, onClose, onUpdate }: { visible: boolean; distributor: Distributor | null; onClose: () => void; onUpdate: (id: string, data: any) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Restaurant");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [minOrder, setMinOrder] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("");
  const [certifications, setCertifications] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productImageName, setProductImageName] = useState("");

  useEffect(() => {
    if (distributor) {
      setName(distributor.name);
      setType(distributor.type);
      setCity(distributor.city);
      setPhone(distributor.phone);
      setAddress(distributor.address || "");
      setOpeningHours(distributor.openingHours || "");
      setDeliveryAvailable(distributor.deliveryAvailable || false);
      setMinOrder(distributor.minOrder || "");
      setPaymentMethods(distributor.paymentMethods?.join(", ") || "");
      setCertifications(distributor.certifications?.join(", ") || "");
      setProducts(distributor.products || []);
    }
  }, [distributor]);

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

  const pickProductImage = async () => {
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
      setProductImage(asset.uri);
      setProductImageName(fileName);
      
      setUploading(true);
      const success = await uploadBase64Image(asset.base64, fileName);
      setUploading(false);
      
      if (!success) {
        Alert.alert("Erreur", "Impossible d'uploader l'image");
        setProductImage(null);
        setProductImageName("");
      }
    }
  };

  const addProduct = () => {
    if (!productName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom de produit");
      return;
    }
    if (!productImageName) {
      Alert.alert("Erreur", "Veuillez sélectionner une image pour le produit");
      return;
    }

    setProducts([...products, { name: productName.trim(), image: productImageName }]);
    setProductName("");
    setProductImage(null);
    setProductImageName("");
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !city.trim() || !phone.trim()) {
      Alert.alert("Erreur", "Veuillez remplir les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const paymentMethodsArray = paymentMethods.split(",").map(p => p.trim()).filter(p => p);
      const certificationsArray = certifications.split(",").map(c => c.trim()).filter(c => c);
      
      const updateData = {
        name,
        type,
        city,
        phone,
        address,
        openingHours,
        deliveryAvailable,
        minOrder,
        paymentMethods: paymentMethodsArray,
        certifications: certificationsArray,
        products,
      };
      
      console.log("Updating distributor with data:", updateData);
      
      await onUpdate(distributor!.id, updateData);
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      Alert.alert("Erreur", "Impossible de modifier le point de vente");
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
          <Text style={styles.modalTitle}>Modifier le point de vente</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.saveButtonText}>Enregistrer</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type *</Text>
            <View style={styles.typeSelector}>
              {["Restaurant", "Point de Vente", "Fournisseur"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeOption, type === t && styles.typeOptionActive]}
                  onPress={() => setType(t as any)}
                >
                  <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ville *</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Horaires</Text>
            <TextInput style={styles.input} value={openingHours} onChangeText={setOpeningHours} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Livraison</Text>
            <View style={styles.switchContainer}>
              <TouchableOpacity style={[styles.switchOption, deliveryAvailable && styles.switchOptionActive]} onPress={() => setDeliveryAvailable(true)}>
                <Text style={[styles.switchText, deliveryAvailable && styles.switchTextActive]}>Oui</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.switchOption, !deliveryAvailable && styles.switchOptionActive]} onPress={() => setDeliveryAvailable(false)}>
                <Text style={[styles.switchText, !deliveryAvailable && styles.switchTextActive]}>Non</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Commande min.</Text>
            <TextInput style={styles.input} value={minOrder} onChangeText={setMinOrder} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Paiements (séparés par des virgules)</Text>
            <TextInput style={styles.input} value={paymentMethods} onChangeText={setPaymentMethods} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Certifications (séparées par des virgules)</Text>
            <TextInput style={styles.input} value={certifications} onChangeText={setCertifications} />
          </View>

          {/* Products Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Produits disponibles</Text>
            
            <View style={styles.addProductContainer}>
              <TextInput
                style={styles.productNameInput}
                value={productName}
                onChangeText={setProductName}
                placeholder="Nom du produit"
                placeholderTextColor={COLORS.muted}
              />
              <TouchableOpacity style={styles.pickImageButton} onPress={pickProductImage}>
                {productImage ? (
                  <Image source={{ uri: productImage }} style={styles.pickImagePreview} />
                ) : (
                  <View style={styles.pickImagePlaceholder}>
                    <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.pickImageText}>Image</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.addProductButton} onPress={addProduct} disabled={uploading}>
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {products.length > 0 && (
              <View style={styles.productsList}>
                {products.map((product, index) => (
                  <ProductItem key={index} product={product} onDelete={() => removeProduct(index)} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Main Distribution Screen Component
const DistributionScreen = () => {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [selectedDistributorForEdit, setSelectedDistributorForEdit] = useState<Distributor | null>(null);

  useEffect(() => {
    loadUserRole();
    loadDistributors();
  }, []);

  const loadUserRole = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
        console.log("User role loaded:", user.role);
      }
      setRoleLoaded(true);
    } catch (error) {
      console.error("Error loading user role:", error);
      setRoleLoaded(true);
    }
  };

  const loadDistributors = async () => {
    setLoading(true);
    try {
      const data = await distributorsApi.getAll();
      setDistributors(data);
    } catch (error) {
      console.error("Error loading distributors:", error);
      Alert.alert("Erreur", "Impossible de charger les points de vente");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDistributor = async (data: any) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/distributors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      });
      
      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        return;
      }
      
      if (!response.ok) throw new Error("Failed to add distributor");
      Alert.alert("Succès", "Point de vente ajouté avec succès");
      await loadDistributors();
    } catch (error) {
      console.error("Error adding distributor:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le point de vente");
    }
  };

  const handleEditDistributor = async (id: string, data: any) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      console.log("Editing distributor with ID:", id);
      console.log("Edit data:", data);
      
      const response = await fetch(`${API_URL}/api/distributors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      });
      
      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Edit failed:", response.status, errorText);
        throw new Error("Failed to update distributor");
      }
      
      const result = await response.json();
      console.log("Edit successful:", result);
      
      Alert.alert("Succès", "Point de vente modifié avec succès");
      await loadDistributors();
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error editing distributor:", error);
      Alert.alert("Erreur", "Impossible de modifier le point de vente");
    }
  };

  const handleDeleteDistributor = async (id: string, name: string) => {
    // For web, use confirm
    if (Platform.OS === 'web') {
      if (!window.confirm(`Voulez-vous vraiment supprimer "${name}" ?`)) return;
    } else {
      // For mobile, use Alert with Promise
      const confirmDelete = await new Promise<boolean>((resolve) => {
        Alert.alert("Confirmation", `Voulez-vous vraiment supprimer "${name}" ?`, [
          { text: "Annuler", style: "cancel", onPress: () => resolve(false) },
          { text: "Supprimer", style: "destructive", onPress: () => resolve(true) },
        ]);
      });
      
      if (!confirmDelete) return;
    }
    
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/distributors/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });

      if (response.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        return;
      }

      if (response.ok) {
        Alert.alert("Succès", "Point de vente supprimé");
        await loadDistributors();
      } else {
        const error = await response.json();
        Alert.alert("Erreur", error.message || "Impossible de supprimer");
      }
    } catch (error) {
      console.error("Error deleting distributor:", error);
      Alert.alert("Erreur", "Erreur réseau");
    }
  };

  const filteredData = selectedType === "All"
    ? distributors
    : distributors.filter((item) => item.type === selectedType);

  const handleVoirPlus = (item: Distributor) => {
    setSelectedDistributor(item);
    setModalVisible(true);
  };

  // Check if user is a distributor (ONLY distributor can manage)
  const isDistributor = userRole === "distributor";

  const renderItem = ({ item }: { item: Distributor }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.badge}>{item.type}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={18} color={COLORS.primary} />
        <Text style={styles.infoText}>{item.city}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={18} color={COLORS.primary} />
        <Text style={styles.infoText}>{item.phone}</Text>
      </View>

      <Text style={styles.productsTitle}>Micro-pousses disponibles :</Text>
      <Text style={styles.products}>
        {item.products?.map((p) => p.name).join(", ") || "Aucun produit"}
      </Text>

      <View style={styles.cardButtons}>
        <TouchableOpacity style={styles.contactButton} onPress={() => handleVoirPlus(item)}>
          <Text style={styles.contactText}>Voir plus</Text>
        </TouchableOpacity>
        
        {/* Edit and Delete Buttons - ONLY for Distributor */}
        {isDistributor && (
          <View style={styles.cardActionButtons}>
            <TouchableOpacity style={[styles.cardActionButton, styles.editButton]} onPress={() => { setSelectedDistributorForEdit(item); setEditModalVisible(true); }}>
              <Ionicons name="create-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardActionButton, styles.deleteButton]} onPress={() => handleDeleteDistributor(item.id, item.name)}>
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading || !roleLoaded) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isDistributorUser = userRole === "distributor";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Add Button - ONLY visible for Distributor */}
      {isDistributorUser && (
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Ajouter un point de vente</Text>
        </TouchableOpacity>
      )}

      <View style={styles.filterContainer}>
        {["All", "Restaurant", "Point de Vente", "Fournisseur"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, selectedType === type && styles.activeFilter]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.filterText, selectedType === type ? styles.activeFilterText : styles.inactiveFilterText]}>
              {type === "All" ? "Tous" : type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>Aucun point de vente trouvé</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false} onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.detailBackButton}>
              <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={[styles.detailHeaderTitle, { color: COLORS.primary }]}>Détails</Text>
            <View style={styles.detailPlaceholder} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedDistributor && (
              <View style={styles.detailInfo}>
                <View style={styles.detailNameRow}>
                  <Text style={[styles.detailName, { color: COLORS.text }]}>{selectedDistributor.name}</Text>
                  <Text style={[styles.detailBadge, { color: COLORS.primary, backgroundColor: COLORS.primaryLight }]}>{selectedDistributor.type}</Text>
                </View>

                <View style={styles.detailLocationRow}>
                  <View style={styles.detailLocationItem}>
                    <Ionicons name="location" size={14} color={COLORS.muted} />
                    <Text style={styles.detailLocationText}>{selectedDistributor.city}</Text>
                  </View>
                  <View style={styles.detailDistanceItem}>
                    <Ionicons name="call" size={14} color={COLORS.primary} />
                    <Text style={[styles.detailDistanceText, { color: COLORS.primary }]}>{selectedDistributor.phone}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: COLORS.text }]}>Micro-pousses disponibles</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScrollView}>
                    <View style={styles.productsRow}>
                      {selectedDistributor.products?.map((product, index) => (
                        <View key={index} style={styles.productCard}>
                          {product.image ? (
                            <Image source={{ uri: getImageUrl(product.image) }} style={styles.productImage} />
                          ) : (
                            <View style={[styles.productImage, { backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center" }]}>
                              <Ionicons name="leaf-outline" size={30} color={COLORS.primary} />
                            </View>
                          )}
                          <Text style={[styles.productName, { color: COLORS.text }]}>{product.name}</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {selectedDistributor.address && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: COLORS.text }]}>Adresse</Text>
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="location" size={16} color={COLORS.primary} />
                      <Text style={[styles.detailInfoText, { color: COLORS.text }]}>{selectedDistributor.address}</Text>
                    </View>
                  </View>
                )}

                {selectedDistributor.openingHours && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: COLORS.text }]}>Horaires d'ouverture</Text>
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="time" size={16} color={COLORS.primary} />
                      <Text style={[styles.detailInfoText, { color: COLORS.text }]}>{selectedDistributor.openingHours}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: COLORS.text }]}>Informations de commande</Text>
                  {selectedDistributor.minOrder && (
                    <View style={styles.detailInfoRow}>
                      <Ionicons name="cart" size={16} color={COLORS.primary} />
                      <Text style={[styles.detailInfoText, { color: COLORS.text }]}>Commande minimale: {selectedDistributor.minOrder}</Text>
                    </View>
                  )}
                  <View style={styles.detailInfoRow}>
                    <Ionicons name={selectedDistributor.deliveryAvailable ? "checkmark-circle" : "close-circle"} size={16} color={selectedDistributor.deliveryAvailable ? COLORS.success : COLORS.danger} />
                    <Text style={[styles.detailInfoText, { color: COLORS.text }]}>Livraison: {selectedDistributor.deliveryAvailable ? "Disponible" : "Non disponible"}</Text>
                  </View>
                  {selectedDistributor.paymentMethods && selectedDistributor.paymentMethods.length > 0 && (
                    <View style={styles.paymentContainer}>
                      <Text style={[styles.paymentLabel, { color: COLORS.text }]}>Moyens de paiement:</Text>
                      <View style={styles.paymentMethods}>
                        {selectedDistributor.paymentMethods.map((method, index) => (
                          <View key={index} style={[styles.paymentChip, { backgroundColor: COLORS.primaryLight }]}>
                            <Text style={[styles.paymentText, { color: COLORS.primary }]}>{method}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {selectedDistributor.certifications && selectedDistributor.certifications.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: COLORS.text }]}>Certifications</Text>
                    <View style={styles.certificationsContainer}>
                      {selectedDistributor.certifications.map((cert, index) => (
                        <View key={index} style={[styles.certificationChip, { backgroundColor: COLORS.primaryLight }]}>
                          <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                          <Text style={[styles.certificationText, { color: COLORS.primary }]}>{cert}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Only show Add/Edit modals if user is Distributor */}
      {isDistributorUser && (
        <>
          <AddDistributorModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} onAdd={handleAddDistributor} />
          <EditDistributorModal visible={editModalVisible} distributor={selectedDistributorForEdit} onClose={() => setEditModalVisible(false)} onUpdate={handleEditDistributor} />
        </>
      )}
    </View>
  );
};

export default DistributionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary, marginHorizontal: 15, marginTop: 15, marginBottom: 10, paddingVertical: 12, borderRadius: 25, gap: 8 },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  listContainer: { padding: 10 },
  filterContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginVertical: 10, paddingHorizontal: 10 },
  filterButton: { backgroundColor: COLORS.card, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, margin: 5, borderWidth: 1, borderColor: COLORS.border },
  activeFilter: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  filterText: { fontWeight: "600", fontSize: 12 },
  activeFilterText: { color: COLORS.primary },
  inactiveFilterText: { color: COLORS.muted },
  card: { backgroundColor: COLORS.card, borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  badge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: "600", color: COLORS.primary },
  infoRow: { flexDirection: "row", alignItems: "center", marginVertical: 3, gap: 6 },
  infoText: { marginLeft: 2, color: COLORS.muted, fontSize: 13 },
  productsTitle: { marginTop: 10, fontWeight: "600", color: COLORS.primary, fontSize: 13 },
  products: { color: COLORS.text, marginBottom: 10, fontSize: 12 },
  cardButtons: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  contactButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 20, alignItems: "center", flex: 1 },
  contactText: { color: "white", fontWeight: "bold", fontSize: 14 },
  cardActionButtons: { flexDirection: "row", gap: 8, marginLeft: 10 },
  cardActionButton: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  editButton: { backgroundColor: COLORS.info },
  deleteButton: { backgroundColor: COLORS.danger },
  emptyContainer: { alignItems: "center", paddingTop: 50 },
  emptyText: { marginTop: 10, fontSize: 14, color: COLORS.muted, fontWeight: "600" },
  detailContainer: { flex: 1, backgroundColor: COLORS.bg },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: COLORS.bg },
  detailBackButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, alignItems: "center", justifyContent: "center", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  detailHeaderTitle: { fontSize: 18, fontWeight: "700" },
  detailPlaceholder: { width: 40 },
  detailInfo: { padding: 20 },
  detailNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  detailName: { fontSize: 22, fontWeight: "800", flex: 1, marginRight: 12 },
  detailBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, fontSize: 12, fontWeight: "600" },
  detailLocationRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 },
  detailLocationItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailLocationText: { fontSize: 13, color: COLORS.muted },
  detailDistanceItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailDistanceText: { fontSize: 13, fontWeight: "600" },
  detailSection: { marginBottom: 25 },
  detailSectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  productsScrollView: { marginBottom: 5 },
  productsRow: { flexDirection: "row", gap: 15, paddingHorizontal: 10 },
  productCard: { alignItems: "center", width: 80 },
  productImage: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primaryLight, marginBottom: 5 },
  productName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  detailInfoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  detailInfoText: { fontSize: 14, flex: 1 },
  paymentContainer: { marginTop: 5 },
  paymentLabel: { fontSize: 13, fontWeight: "500", marginBottom: 8 },
  paymentMethods: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  paymentChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  paymentText: { fontSize: 11, fontWeight: "500" },
  certificationsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  certificationChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, gap: 4 },
  certificationText: { fontSize: 11, fontWeight: "500" },
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.card },
  modalTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  saveButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.primary },
  modalContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "500", color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  typeSelector: { flexDirection: "row", gap: 10 },
  typeOption: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  typeOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeOptionText: { fontSize: 14, color: COLORS.text },
  typeOptionTextActive: { color: "#fff" },
  switchContainer: { flexDirection: "row", gap: 10 },
  switchOption: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  switchOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  switchText: { fontSize: 14, color: COLORS.text },
  switchTextActive: { color: "#fff" },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 10, marginBottom: 30 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  addProductContainer: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  productNameInput: { flex: 2, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: COLORS.text },
  pickImageButton: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, overflow: 'hidden' },
  pickImagePreview: { width: 50, height: 50, borderRadius: 8 },
  pickImagePlaceholder: { width: 50, height: 50, justifyContent: "center", alignItems: "center" },
  pickImageText: { fontSize: 10, color: COLORS.primary, marginTop: 2 },
  addProductButton: { padding: 4 },
  productsList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  productItemCard: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 8, gap: 8 },
  productItemImage: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight },
  productItemName: { fontSize: 13, fontWeight: "500", color: COLORS.text, flex: 1 },
  productItemDelete: { padding: 4 },
});