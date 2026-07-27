// app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { API_URL } from '../../src/config/api';
import { getUser, signOut, AuthedUser } from '../../src/lib/auth';

import { isGuestMode, disableGuestMode } from '../../src/services/guest';

const { width: W, height: H } = Dimensions.get('window');



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

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
const [questionsLoading, setQuestionsLoading] = useState(true);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  
  // Nutritionist Questionnaire States
  const [showNutritionistQuiz, setShowNutritionistQuiz] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [nutritionistAnswers, setNutritionistAnswers] = useState<Record<string, any>>({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [hasExistingAnswers, setHasExistingAnswers] = useState(false);
  const [autreInputs, setAutreInputs] = useState<Record<string, string>>({});
  const [showAutreInput, setShowAutreInput] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      
      loadSavedData();
      loadNutritionistAnswers();
    }, [])
  );

  useEffect(() => {
    loadUserData();
   
    loadSavedData();
    loadNutritionistAnswers();
    loadQuestions();
  }, []);

  const loadUserData = async () => {
    try {
      const guest = await isGuestMode();
      if (guest) {
        setIsGuest(true);
        setUser(null);
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem('auth_token');

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();

      setUser(data);
      setIsGuest(false);

      setEditName(data.name || '');
      setEditEmail(data.email || '');
      setEditPhone(data.phone || '');
      setEditCountry(data.country || '');

    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNutritionistAnswers = async () => {
    try {
      // First try to load from local storage
      const localAnswers = await AsyncStorage.getItem('nutritionist_answers');
      if (localAnswers) {
        const parsedAnswers = JSON.parse(localAnswers);
        setNutritionistAnswers(parsedAnswers);
        setHasExistingAnswers(true);
      }
      
      // Then load from backend (recommendations) to keep sync
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
            setNutritionistAnswers(latestRecommendation.answers);
            setHasExistingAnswers(true);
            // Also save to local storage
            await AsyncStorage.setItem('nutritionist_answers', JSON.stringify(latestRecommendation.answers));
          }
        }
      }
    } catch (error) {
      console.error("Error loading nutritionist answers:", error);
      if (!hasExistingAnswers) {
        setHasExistingAnswers(false);
      }
    }
  };

  

  const loadSavedData = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('@profile_image');
      if (savedImage) setProfileImage(savedImage);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const pickImage = async () => {
    if (isGuest) {
      Alert.alert('Mode invité', 'Connectez-vous pour modifier votre photo de profil');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      await AsyncStorage.setItem('@profile_image', imageUri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }
    if (!editEmail.trim()) {
      Alert.alert('Erreur', "L'email ne peut pas être vide");
      return;
    }

    setIsEditing(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        Alert.alert('Erreur', 'Vous n\'êtes pas connecté. Veuillez vous reconnecter.');
        setIsEditing(false);
        return;
      }
      
      const updateData = {
        fullname: editName,
        email: editEmail,
        phone: editPhone,
        country: editCountry
      };
      
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.status === 401) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter');
        await signOut();
        router.replace('/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const responseData = await response.json();
      
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      setEditModalVisible(false);
      
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, name: editName, email: editEmail };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil');
    } finally {
      setIsEditing(false);
    }
  };

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre message');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: supportMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      Alert.alert('Succès', 'Message envoyé à notre équipe support');
      setSupportModalVisible(false);
      setSupportMessage('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/welcome');
        },
      },
    ]);
  };

  const handleGuestSignup = () => {
    Alert.alert(
      'Créez un compte',
      'Créez un compte pour sauvegarder vos favoris et profiter de toutes les fonctionnalités !',
      [
        { text: 'Plus tard', style: 'cancel' },
        {
          text: 'Créer un compte',
          onPress: () => router.push('/register'),
        },
      ]
    );
  };

  const handleGuestLogin = () => {
    router.push('/login');
  };
  // questions code
  // Add this function
const loadQuestions = async () => {
  setQuestionsLoading(true);
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) {
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

  

  // Nutritionist Questionnaire Handlers
  const startNutritionistQuiz = () => {
    setCurrentStep(0);
    setShowNutritionistQuiz(true);
  };

  const toggleAutreInput = (questionId: string) => {
    setShowAutreInput(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
    // If closing, remove the "autre" selection if it exists
    if (showAutreInput[questionId]) {
      const currentAnswer = nutritionistAnswers[questionId];
      const question = questions.find(q => q.id === questionId);
      if (question?.type === 'single') {
        // For single choice, remove the answer if it's "autre"
        if (typeof currentAnswer === 'string' && currentAnswer.startsWith('autre:')) {
          const newAnswers = { ...nutritionistAnswers };
          delete newAnswers[questionId];
          setNutritionistAnswers(newAnswers);
        }
      } else {
        // For multiple choice, remove any "autre:" entries
        if (Array.isArray(currentAnswer)) {
          const filtered = currentAnswer.filter((a: string) => !a.startsWith('autre:'));
          const newAnswers = { ...nutritionistAnswers, [questionId]: filtered };
          setNutritionistAnswers(newAnswers);
        }
      }
    }
  };

  const handleSingleSelect = (questionId: string, optionId: string) => {
    if (optionId === 'autre') {
      // Toggle autre input
      toggleAutreInput(questionId);
      return;
    }
    // If any autre input was open, close it
    if (showAutreInput[questionId]) {
      setShowAutreInput(prev => ({ ...prev, [questionId]: false }));
    }
    const newAnswers = { ...nutritionistAnswers, [questionId]: optionId };
    setNutritionistAnswers(newAnswers);
  };

  const handleMultipleSelect = (questionId: string, optionId: string) => {
    if (optionId === 'autre') {
      // Toggle autre input
      toggleAutreInput(questionId);
      return;
    }
    
    const currentSelections = nutritionistAnswers[questionId] || [];
    let newSelections;
    
    // If "aucun" or "aucune" is selected, clear all selections first
    if (optionId === "aucun" || optionId === "aucune") {
      // Remove any "autre:" entries if "aucun" is selected
      if (showAutreInput[questionId]) {
        setShowAutreInput(prev => ({ ...prev, [questionId]: false }));
      }
      newSelections = [optionId];
    } else {
      // Remove "aucun"/"aucune" if they exist
      let filtered = currentSelections.filter((id: string) => id !== "aucun" && id !== "aucune");
      // Remove any "autre:" entries when selecting a predefined option
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
    
    const newAnswers = { ...nutritionistAnswers, [questionId]: newSelections };
    setNutritionistAnswers(newAnswers);
  };

  const handleAutreTextChange = (questionId: string, text: string) => {
    setAutreInputs(prev => ({ ...prev, [questionId]: text }));
    // Update the answer with the custom text
    const question = questions.find(q => q.id === questionId);
    if (question?.type === 'single') {
      if (text.trim()) {
        const newAnswers = { ...nutritionistAnswers, [questionId]: `autre: ${text.trim()}` };
        setNutritionistAnswers(newAnswers);
      } else {
        // If text is empty, remove the answer
        const newAnswers = { ...nutritionistAnswers };
        delete newAnswers[questionId];
        setNutritionistAnswers(newAnswers);
      }
    } else {
      // For multiple choice
      const currentSelections = nutritionistAnswers[questionId] || [];
      // Remove any existing "autre:" entries
      const filtered = currentSelections.filter((id: string) => !id.startsWith('autre:'));
      if (text.trim()) {
        const newSelections = [...filtered, `autre: ${text.trim()}`];
        const newAnswers = { ...nutritionistAnswers, [questionId]: newSelections };
        setNutritionistAnswers(newAnswers);
      } else {
        // If text is empty, just keep the filtered selections
        const newAnswers = { ...nutritionistAnswers, [questionId]: filtered };
        setNutritionistAnswers(newAnswers);
      }
    }
  };

  const isOptionSelected = (questionId: string, optionId: string): boolean => {
    const answer = nutritionistAnswers[questionId];
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
    const answer = nutritionistAnswers[questionId];
    if (!answer) return false;
    if (Array.isArray(answer)) {
      return answer.some((a: string) => a.startsWith('autre:'));
    }
    return answer.startsWith('autre:');
  };

  const getAutreText = (questionId: string): string => {
    const answer = nutritionistAnswers[questionId];
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

  const handleNext = () => {
    const currentQuestion = questions[currentStep];
    const currentAnswer = nutritionistAnswers[currentQuestion.id];
    
    // Check if "autre" is open but empty
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
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitNutritionistQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitNutritionistQuiz = async () => {
    setQuizLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      // Save locally first
      await AsyncStorage.setItem('nutritionist_answers', JSON.stringify(nutritionistAnswers));
      
      // Get the user's existing recommendation ID
      const getResponse = await fetch(`${API_URL}/api/recommendations/user`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (getResponse.ok) {
        const recommendations = await getResponse.json();
        
        if (recommendations && recommendations.length > 0) {
          // User has existing recommendation - UPDATE it (NO new request created)
          const existingId = recommendations[0].id;
          
          const updateResponse = await fetch(`${API_URL}/api/recommendations/${existingId}/answers`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              answers: nutritionistAnswers,
            }),
          });
          
          if (updateResponse.ok) {
            console.log("✅ Updated existing recommendation answers");
            Alert.alert(
              "Succès", 
              "Vos informations nutritionnelles ont été mises à jour !"
            );
          } else {
            const errorData = await updateResponse.json();
            console.error("Update failed:", errorData);
            Alert.alert("Information", "Vos informations ont été enregistrées localement.");
          }
        } else {
          // No existing recommendation - just save locally
          Alert.alert("Succès", "Vos informations ont été enregistrées localement.");
        }
      } else {
        Alert.alert("Succès", "Vos informations ont été enregistrées localement.");
      }
      
      setShowNutritionistQuiz(false);
      setCurrentStep(0);
      setHasExistingAnswers(true);
      
    } catch (error) {
      console.error("Error saving nutritionist answers:", error);
      Alert.alert("Succès", "Vos informations ont été enregistrées localement.");
      setShowNutritionistQuiz(false);
      setCurrentStep(0);
      setHasExistingAnswers(true);
    } finally {
      setQuizLoading(false);
    }
  };

  const getUserName = () => {
    if (isGuest) return 'Invité';
    if (!user?.name) return 'Utilisateur';
    return user.name;
  };

  const getUserEmail = () => {
    if (isGuest) return 'mode invité';
    if (!user?.email) return 'utilisateur@email.com';
    return user.email;
  };

  const getUserPhone = () => {
    if (isGuest) return 'Non renseigné';
    return editPhone || 'Non renseigné';
  };

  const getUserCountry = () => {
    if (isGuest) return 'Non renseignée';
    return editCountry || 'Non renseignée';
  };

  const getInitials = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c7744" />
      </View>
    );
  }

  // Nutritionist Quiz View
if (showNutritionistQuiz && !isGuest) {
  // Use questions state, fallback to NUTRITIONIST_QUESTIONS if empty
  const currentQuestions = questions.length > 0 ? questions : questions;
  const currentQuestion = currentQuestions[currentStep];
  
  // If still no questions, show loading
  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c7744" />
        <Text style={{ marginTop: 12, color: '#888' }}>Chargement des questions...</Text>
      </View>
    );
  }
  
  const progress = ((currentStep + 1) / currentQuestions.length) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f6' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f7f6" />
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}>
        <TouchableOpacity 
          onPress={() => {
            setShowNutritionistQuiz(false);
            setCurrentStep(0);
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#2c7744" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600", color: "#1a2e35" }}>
          Informations Nutritionnelles
        </Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 }}>
        <View style={{ height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
          <View style={{ height: '100%', backgroundColor: '#2c7744', borderRadius: 2, width: `${progress}%` }} />
        </View>
        <Text style={{ fontSize: 12, color: '#888', marginTop: 8, textAlign: 'center' }}>
          Question {currentStep + 1} / {currentQuestions.length}
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ alignSelf: 'flex-start', backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#2c7744' }}>{currentQuestion.category}</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#1a2e35', marginBottom: 24 }}>{currentQuestion.title}</Text>
          
          <View style={{ gap: 12 }}>
            {currentQuestion.options && currentQuestion.options.map((option: any) => {
              const isSelected = option.id === 'autre' ? isAutreSelected(currentQuestion.id) : isOptionSelected(currentQuestion.id, option.id);
              const showInput = showAutreInput[currentQuestion.id] || false;
              
              return (
                <View key={option.id}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#fff',
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: isSelected ? '#2c7744' : '#e0e0e0',
                      backgroundColor: isSelected ? '#e8f5e9' : '#fff',
                    }}
                    onPress={() => {
                      if (currentQuestion.type === "single") {
                        handleSingleSelect(currentQuestion.id, option.id);
                      } else {
                        handleMultipleSelect(currentQuestion.id, option.id);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: isSelected ? '#2c7744' : '#333' }}>
                      {option.label}
                    </Text>
                    {isSelected && currentQuestion.type === "single" && (
                      <Ionicons name="checkmark-circle" size={22} color="#2c7744" />
                    )}
                    {isSelected && currentQuestion.type === "multiple" && (
                      <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: '#2c7744', justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    )}
                    {!isSelected && currentQuestion.type === "multiple" && (
                      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#e0e0e0' }} />
                    )}
                  </TouchableOpacity>
                  
                  {option.id === 'autre' && (showInput || isAutreSelected(currentQuestion.id)) && (
                    <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
                      <TextInput
                        style={{
                          backgroundColor: '#fff',
                          borderWidth: 1,
                          borderColor: '#2c7744',
                          borderRadius: 8,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          fontSize: 15,
                          color: '#1a2e35',
                        }}
                        placeholder="Saisissez votre réponse..."
                        placeholderTextColor="#888"
                        value={getAutreText(currentQuestion.id) || autreInputs[currentQuestion.id] || ''}
                        onChangeText={(text) => {
                          setAutreInputs(prev => ({ ...prev, [currentQuestion.id]: text }));
                          handleAutreTextChange(currentQuestion.id, text);
                        }}
                        autoFocus
                        multiline={false}
                      />
                      {isAutreSelected(currentQuestion.id) && (
                        <Text style={{ fontSize: 12, color: '#2c7744', marginTop: 4, fontStyle: 'italic' }}>
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

      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
        {currentStep > 0 && (
          <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2c7744' }} onPress={handlePrevious}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#2c7744' }}>Précédent</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{ flex: currentStep === 0 ? 1 : 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2c7744', paddingVertical: 14, borderRadius: 12 }}
          onPress={handleNext}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            {currentStep === currentQuestions.length - 1 ? "Enregistrer" : "Suivant"}
          </Text>
        </TouchableOpacity>
      </View>

      {quizLoading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', width: W * 0.7 }}>
            <ActivityIndicator size="large" color="#2c7744" />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a2e35', marginTop: 16, marginBottom: 8 }}>Enregistrement...</Text>
            <Text style={{ fontSize: 14, color: '#888' }}>Veuillez patienter</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#e9edf3" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.container}>
          {/* Guest Banner */}
          {isGuest && (
            <View style={styles.guestBanner}>
              <Ionicons name="information-circle-outline" size={20} color="#2c7744" />
              <Text style={styles.guestBannerText}>Vous êtes en mode invité</Text>
            </View>
          )}

          {/* Profile Image Section */}
          <TouchableOpacity onPress={pickImage} style={styles.profileImgContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImg} />
            ) : (
              <View style={[styles.profileImg, styles.profileImgPlaceholder]}>
                <Text style={styles.profileInitials}>{getInitials()}</Text>
              </View>
            )}
            {!isGuest && (
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={W * 0.035} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {/* User Info */}
          <Text style={styles.name}>{getUserName()}</Text>
          <Text style={styles.desc}>{getUserEmail()}</Text>

          {/* Guest Action Buttons */}
          {isGuest && (
            <View style={styles.guestButtonsContainer}>
              <TouchableOpacity style={styles.guestLoginButton} onPress={handleGuestLogin}>
                <Text style={styles.guestLoginButtonText}>Se connecter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.guestSignupButton} onPress={handleGuestSignup}>
                <Text style={styles.guestSignupButtonText}>Créer un compte</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Nutritionist Information Section - Only for non-guest */}
          {!isGuest && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Informations nutritionnelles</Text>
              </View>
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.nutritionistCard}
                  onPress={startNutritionistQuiz}
                >
                  <View style={styles.nutritionistIconContainer}>
                    <Ionicons name="nutrition-outline" size={W * 0.055} color="#2c7744" />
                  </View>
                  <View style={styles.nutritionistInfo}>
                    <Text style={styles.nutritionistTitle}>
                      {hasExistingAnswers ? "Modifier mon profil nutritionnel" : "Compléter mon profil nutritionnel"}
                    </Text>
                    <View style={styles.nutritionistStatus}>
                      <Ionicons 
                        name={hasExistingAnswers ? "checkmark-circle" : "time-outline"} 
                        size={14} 
                        color={hasExistingAnswers ? "#4caf50" : "#ff9800"} 
                      />
                      <Text style={[styles.nutritionistStatusText, { color: hasExistingAnswers ? "#4caf50" : "#ff9800" }]}>
                        {hasExistingAnswers ? "Profil complété" : "Non complété"}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#aaa" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Personal Info Section - Hide for guests */}
          {!isGuest && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Informations personnelles</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                  <Text style={styles.editText}>Modifier</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="mail-outline" size={W * 0.045} color="#d8a64c" />
                  </View>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{getUserEmail()}</Text>
                </View>

                <View style={styles.row}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="call-outline" size={W * 0.045} color="#d8a64c" />
                  </View>
                  <Text style={styles.label}>Téléphone</Text>
                  <Text style={styles.value}>{getUserPhone()}</Text>
                </View>

                <View style={styles.row}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="location-outline" size={W * 0.045} color="#d8a64c" />
                  </View>
                  <Text style={styles.label}>Pays</Text>
                  <Text style={styles.value}>{getUserCountry()}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Utilities Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>Paramètres</Text>
            </View>

            <View style={styles.card}>
              {/* Logout */}
              <TouchableOpacity
                style={[styles.utilityItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <View style={styles.utilityLeft}>
                  <Ionicons name="log-out-outline" size={W * 0.045} color="#e53935" />
                  <Text style={[styles.utilityText, styles.logoutText]}>Se déconnecter</Text>
                </View>
                <Ionicons name="chevron-forward" size={W * 0.045} color="#e53935" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal - Only for non-guest */}
      <Modal
        visible={editModalVisible && !isGuest}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#2c7744" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TouchableOpacity onPress={handleUpdateProfile} disabled={isEditing}>
              {isEditing ? (
                <ActivityIndicator size="small" color="#2c7744" />
              ) : (
                <Text style={styles.sendText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Votre nom"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Votre email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Votre numéro de téléphone"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pays</Text>
              <TextInput
                style={styles.input}
                value={editCountry}
                onChangeText={setEditCountry}
                placeholder="Votre pays"
                placeholderTextColor="#888"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      
        
      
    </SafeAreaView>
  );
}

// Styles remain the same...

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e9edf3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9edf3',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: H * 0.02,
  },
  container: {
    width: W * 0.9,
    maxWidth: 400,
    backgroundColor: '#eef2f7',
    borderRadius: W * 0.05,
    padding: W * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 5,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: H * 0.015,
    paddingHorizontal: W * 0.04,
    borderRadius: W * 0.03,
    marginBottom: H * 0.02,
    gap: W * 0.02,
  },
  guestBannerText: {
    fontSize: W * 0.035,
    color: '#2c7744',
    fontWeight: '500',
  },
  guestButtonsContainer: {
    flexDirection: 'row',
    gap: W * 0.03,
    marginTop: H * 0.02,
    marginBottom: H * 0.02,
  },
  guestLoginButton: {
    flex: 1,
    backgroundColor: '#2c7744',
    paddingVertical: H * 0.012,
    borderRadius: W * 0.04,
    alignItems: 'center',
  },
  guestLoginButtonText: {
    color: '#fff',
    fontSize: W * 0.035,
    fontWeight: '600',
  },
  guestSignupButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2c7744',
    paddingVertical: H * 0.012,
    borderRadius: W * 0.04,
    alignItems: 'center',
  },
  guestSignupButtonText: {
    color: '#2c7744',
    fontSize: W * 0.035,
    fontWeight: '600',
  },
  profileImgContainer: {
    position: 'relative',
    width: W * 0.25,
    height: W * 0.25,
    maxWidth: 100,
    maxHeight: 100,
    margin: 'auto',
    alignSelf: 'center',
  },
  profileImg: {
    width: '100%',
    height: '100%',
    borderRadius: W * 0.125,
    backgroundColor: '#ddd',
  },
  profileImgPlaceholder: {
    backgroundColor: '#2c7744',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: W * 0.08,
    fontWeight: '600',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#d8a64c',
    width: W * 0.07,
    height: W * 0.07,
    maxWidth: 28,
    maxHeight: 28,
    borderRadius: W * 0.035,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eef2f7',
  },
  name: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: H * 0.015,
    fontSize: W * 0.045,
    color: '#333',
  },
  desc: {
    textAlign: 'center',
    fontSize: W * 0.032,
    color: 'gray',
    marginTop: H * 0.005,
  },
  section: {
    marginTop: H * 0.025,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: H * 0.012,
    paddingHorizontal: W * 0.01,
  },
  sectionHeaderText: {
    fontSize: W * 0.035,
    color: '#888',
    fontWeight: '500',
  },
  editText: {
    fontSize: W * 0.035,
    color: '#2c7744',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: W * 0.04,
    paddingVertical: H * 0.005,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: H * 0.015,
    paddingHorizontal: W * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    width: W * 0.08,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    color: '#888',
    fontSize: W * 0.035,
    marginLeft: W * 0.015,
  },
  value: {
    fontSize: W * 0.035,
    color: '#333',
    flex: 1.5,
  },
  utilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: H * 0.015,
    paddingHorizontal: W * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  utilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: W * 0.025,
  },
  utilityText: {
    fontSize: W * 0.035,
    color: '#333',
    marginLeft: W * 0.025,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: W * 0.02,
  },
  badgeCount: {
    fontSize: W * 0.035,
    fontWeight: '600',
    color: '#2c7744',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#e53935',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f2f3f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: W * 0.05,
    paddingVertical: H * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: W * 0.045,
    fontWeight: '600',
    color: '#1a2e35',
  },
  sendText: {
    fontSize: W * 0.04,
    fontWeight: '600',
    color: '#2c7744',
  },
  modalContent: {
    padding: W * 0.05,
  },
  modalList: {
    padding: W * 0.04,
  },
  inputGroup: {
    marginBottom: H * 0.02,
  },
  inputLabel: {
    fontSize: W * 0.035,
    fontWeight: '500',
    marginBottom: H * 0.008,
    color: '#1a2e35',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: W * 0.03,
    paddingHorizontal: W * 0.04,
    paddingVertical: H * 0.012,
    fontSize: W * 0.04,
    backgroundColor: '#fff',
    color: '#1a2e35',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: W * 0.03,
    paddingHorizontal: W * 0.04,
    paddingVertical: H * 0.012,
    fontSize: W * 0.04,
    minHeight: H * 0.2,
    backgroundColor: '#fff',
    color: '#1a2e35',
  },
  helpText: {
    fontSize: W * 0.03,
    textAlign: 'center',
    marginTop: H * 0.01,
    color: '#888',
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: H * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    paddingHorizontal: W * 0.03,
    borderRadius: W * 0.02,
    marginBottom: H * 0.01,
  },
  favoriteItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: W * 0.03,
  },
  favoritePlaceholder: {
    width: W * 0.12,
    height: W * 0.12,
    borderRadius: W * 0.03,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteImage: {
    width: W * 0.12,
    height: W * 0.12,
    borderRadius: W * 0.03,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: W * 0.04,
    fontWeight: '600',
    color: '#1a2e35',
    marginBottom: H * 0.005,
  },
  favoriteTypeText: {
    fontSize: W * 0.03,
    color: '#888',
  },
  favoriteAuthor: {
    fontSize: W * 0.028,
    color: '#888',
    marginTop: H * 0.002,
  },
  removeButton: {
    padding: W * 0.02,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: W * 0.1,
  },
  emptyText: {
    fontSize: W * 0.05,
    fontWeight: '600',
    color: '#1a2e35',
    marginBottom: H * 0.01,
  },
  emptySubtext: {
    fontSize: W * 0.035,
    textAlign: 'center',
    color: '#888',
  },
  // Nutritionist Card Styles
  nutritionistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: H * 0.02,
    paddingHorizontal: W * 0.04,
  },
  nutritionistIconContainer: {
    width: W * 0.12,
    height: W * 0.12,
    borderRadius: W * 0.06,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: W * 0.03,
  },
  nutritionistInfo: {
    flex: 1,
  },
  nutritionistTitle: {
    fontSize: W * 0.038,
    fontWeight: '600',
    color: '#1a2e35',
    marginBottom: H * 0.005,
  },
  nutritionistStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: W * 0.02,
  },
  nutritionistStatusText: {
    fontSize: W * 0.028,
  },
  // Autre Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  autreModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: W * 0.85,
    maxWidth: 400,
  },
  autreModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2e35',
    marginBottom: 8,
    textAlign: 'center',
  },
  autreModalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  autreModalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#1a2e35',
    backgroundColor: '#f8f9fa',
  },
  autreModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  autreModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  autreModalCancelButton: {
    backgroundColor: '#f1f3f4',
  },
  autreModalConfirmButton: {
    backgroundColor: '#2c7744',
  },
  autreModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  autreModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});