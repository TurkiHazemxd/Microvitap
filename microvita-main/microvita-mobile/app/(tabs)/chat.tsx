// app/(tabs)/chat.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, CHATBOT_URL } from "../../src/config/api";
import { getUser } from "../../src/lib/auth";

const { width, height } = Dimensions.get("window");

// Theme colors
const LIGHT_THEME = {
  primary: "#0b6e4f",
  primaryLight: "#e8f5e9",
  bg: "#f6f7f6",
  card: "#ffffff",
  border: "#e5e5e5",
  text: "#1a2e35",
  textSecondary: "#6c757d",
  userMessage: "#0b6e4f",
  userMessageText: "#ffffff",
  assistantMessage: "#e8f5e9",
  assistantMessageText: "#1a2e35",
  sidebarBg: "#ffffff",
  sidebarText: "#1a2e35",
  sidebarActive: "#0b6e4f",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  inputBg: "#f6f7f6",
  inputDisabledBg: "#e5e5e5",
};

const DARK_THEME = {
  primary: "#2ecc71",
  primaryLight: "#1a3a2a",
  bg: "#121212",
  card: "#1e1e1e",
  border: "#333333",
  text: "#ffffff",
  textSecondary: "#a0a0a0",
  userMessage: "#2ecc71",
  userMessageText: "#1a2e35",
  assistantMessage: "#1e3a2a",
  assistantMessageText: "#ffffff",
  sidebarBg: "#1e1e1e",
  sidebarText: "#ffffff",
  sidebarActive: "#2ecc71",
  danger: "#e74c3c",
  warning: "#f39c12",
  info: "#3498db",
  inputBg: "#2a2a2a",
  inputDisabledBg: "#333333",
};

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  conversationId?: string;
}

interface Conversation {
  id: string;
  titre: string;
  dateDebut: string;
  dateModification: string;
  isPinned?: boolean;
}

type Mode = "debutant" | "avance";

const suggestedQuestions = {
  debutant: [
    "C'est quoi les micropousses ?",
    "Comment éviter les moisissures ?",
    "Les micropousses sont-elles sans danger ?",
    "Quelle est l'histoire des micropousses ?",
    "Quelle micropousse est la plus nutritive ?",
    "Combien de temps pour faire pousser les micropousses ?",
    "Quelles vitamines contiennent les micropousses ?",
    "Les micropousses conviennent-elles aux diabétiques ?",
    "Où acheter des micropousses ?",
    "Comment choisir des micropousses de qualité ?",
    "Quel est le prix moyen des micropousses ?",
    "Peut-on commander des micropousses en ligne ?",
  ],
  avance: [],
};

// Predefined answers for beginner mode
const predefinedAnswers: Record<string, string> = {
  "C'est quoi les micropousses ?": "Les micropousses sont de jeunes pousses de légumes récoltées 7 à 21 jours après la germination, juste après l'apparition des premières feuilles. Elles sont connues pour leurs saveurs intenses et leur haute densité nutritionnelle — souvent 4 à 40 fois plus riches en nutriments que les légumes adultes.",
  "Comment éviter les moisissures ?": "La moisissure est presque toujours causée par un excès d'arrosage ou une mauvaise aération. Passez à l'arrosage par le bas uniquement, ajoutez un petit ventilateur, réduisez la densité des graines et assurez un bon drainage. Évitez de vaporiser les feuilles directement.",
  "Les micropousses sont-elles sans danger ?": "Oui, à condition de les cultiver dans des conditions hygiéniques, avec de l'eau propre et des graines non traitées. Rincez-les avant consommation et conservez-les au réfrigérateur.",
  "Quelle est l'histoire des micropousses ?": "Les micropousses sont apparues dans les années 1980 dans les restaurants gastronomiques californiens. Elles ont gagné en popularité dans les années 2000 grâce à leur profil nutritionnel exceptionnel et sont aujourd'hui cultivées dans le monde entier.",
  "Quelle micropousse est la plus nutritive ?": "Les micropousses de brocoli sont considérées comme les plus nutritives. Elles sont exceptionnellement riches en sulforaphane, un composé aux propriétés anti-inflammatoires et potentiellement anticancéreuses — jusqu'à 100 fois plus que le brocoli adulte.",
  "Combien de temps pour faire pousser les micropousses ?": "La plupart des variétés sont prêtes en 7 à 14 jours. Les variétés rapides comme le radis sont prêtes en 6 à 8 jours. Les plus lentes comme le basilic et la coriandre peuvent prendre jusqu'à 21 jours.",
  "Quelles vitamines contiennent les micropousses ?": "Les micropousses sont riches en vitamines C, E, K et en bêta-carotène (provitamine A). Elles contiennent également des minéraux essentiels comme le fer, le calcium et le magnésium.",
  "Les micropousses conviennent-elles aux diabétiques ?": "Oui, notamment les micropousses de fenugrec et de brocoli, qui aident à réguler la glycémie. Leur faible index glycémique et leur richesse en fibres en font un aliment adapté aux diabétiques.",
  "Où acheter des micropousses ?": "Vous pouvez trouver des micropousses dans les épiceries bio, les marchés locaux, les grandes surfaces et certaines fermes urbaines. L'application MicroVita vous aide à localiser les producteurs près de chez vous.",
  "Comment choisir des micropousses de qualité ?": "Choisissez des micropousses aux tiges fermes, aux feuilles vives et sans odeur suspecte. Évitez les lots visiblement humides ou jaunis. Privilégiez les producteurs locaux pour une fraîcheur maximale.",
  "Quel est le prix moyen des micropousses ?": "Le prix varie selon la variété et le lieu d'achat, généralement entre 3 et 8 euros les 100g. Les micropousses cultivées à domicile reviennent à environ 10 fois moins cher.",
  "Peut-on commander des micropousses en ligne ?": "Oui, plusieurs boutiques spécialisées proposent des micropousses fraîches livrées à domicile en 24 à 48h. Vérifiez les conditions d'expédition pour garantir la fraîcheur à la réception.",
};

const welcomeMessages = {
  debutant: {
    title: "Assistant MicroVita",
    subtitle: "Débutant",
    message:
      "Bonjour ! Je suis votre assistant MicroVita. Posez-moi toutes vos questions sur les micro-pousses, leur culture, leurs bienfaits et leurs utilisations.",
  },
  avance: {
    title: "Assistant MicroVita Pro",
    subtitle: "Avancé",
    message:
      "Bienvenue en mode Avancé ! Je suis votre assistant expert en micro-pousses. Posez-moi des questions techniques sur la culture professionnelle, l'optimisation des rendements, les paramètres environnementaux, et les techniques avancées.",
  },
};

// ========== MODIFIED: callPythonChatbot with conversation history support ==========
const callPythonChatbot = async (question: string, mode: Mode, conversationId: string | null, history: Array<{role: string, content: string}> = []): Promise<string> => {
  try {
    console.log("📤 Sending to chatbot:", question);
    console.log("📚 History length:", history.length);
    
    // For advanced mode, send the conversation history
    // For beginner mode, send empty history
    const historyToSend = mode === "avance" ? history : [];
    
    const response = await fetch(`${CHATBOT_URL}/chat/advanced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        message: question,
        history: historyToSend,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Response error:", response.status, errorText);
      return `Erreur: ${response.status}`;
    }

    const data = await response.json();
    console.log("✅ Chatbot response received");
    return data.answer;
    
  } catch (error: any) {
    console.error("❌ Fetch error:", error.message);
    return `Erreur de connexion: ${error.message}`;
  }
};

// Call FAQ for Beginner mode
const callFaqChatbot = async (question: string): Promise<string> => {
  try {
    const response = await fetch(`${CHATBOT_URL}/chat/basic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: question,
        lang: "fr",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.answer) {
        return data.answer;
      } else {
        return data.suggestion || "Aucune réponse trouvée. Essayez le mode Avancé.";
      }
    } else {
      return "Désolé, une erreur est survenue. Veuillez réessayer.";
    }
  } catch (error) {
    console.error("Error calling FAQ:", error);
    return "Erreur de connexion au serveur.";
  }
};

export default function ChatScreen() {
  const [mode, setMode] = useState<Mode>("debutant");
  const [modeModalVisible, setModeModalVisible] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // ========== NEW: Conversation history for chatbot context ==========
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  
  const sidebarAnim = useRef(new Animated.Value(-width)).current;
  const flatListRef = useRef<FlatList>(null);

  const COLORS = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkIfGuest();
    loadConversations();
  }, []);

  const checkIfGuest = async () => {
    const user = await getUser();
    if (user?.isGuest || user?.role === 'guest') {
      setIsGuest(true);
      if (mode !== 'debutant') {
        setMode('debutant');
      }
    } else {
      setIsGuest(false);
    }
  };

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const loadConversations = async () => {
    if (isGuest) {
      setLoadingConversations(false);
      return;
    }
    
    setLoadingConversations(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/chat/conversations`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const pinnedConversations = await getPinnedConversations();
        const conversationsWithPin = data.map((conv: Conversation) => ({
          ...conv,
          isPinned: pinnedConversations.includes(conv.id),
        }));
        const sorted = conversationsWithPin.sort((a: Conversation, b: Conversation) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime();
        });
        setConversations(sorted);
        
        if (sorted.length > 0 && !currentConversationId) {
          const mostRecent = sorted[0];
          setCurrentConversationId(mostRecent.id);
          await loadMessages(mostRecent.id);
        } else if (sorted.length === 0) {
          await createNewConversation();
        }
      } else if (response.status === 404) {
        await createNewConversation();
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      await createNewConversation();
    } finally {
      setLoadingConversations(false);
    }
  };

  const getPinnedConversations = async (): Promise<string[]> => {
    try {
      const pinned = await AsyncStorage.getItem("pinned_conversations");
      return pinned ? JSON.parse(pinned) : [];
    } catch {
      return [];
    }
  };

  const savePinnedConversations = async (pinnedIds: string[]) => {
    await AsyncStorage.setItem("pinned_conversations", JSON.stringify(pinnedIds));
  };

  const togglePinConversation = async (conversation: Conversation) => {
    if (isGuest) {
      Alert.alert("Mode invité", "Connectez-vous pour épingler des conversations");
      closeContextMenu();
      return;
    }
    
    const pinnedIds = await getPinnedConversations();
    let newPinnedIds: string[];
    
    if (conversation.isPinned) {
      newPinnedIds = pinnedIds.filter(id => id !== conversation.id);
    } else {
      newPinnedIds = [...pinnedIds, conversation.id];
    }
    
    await savePinnedConversations(newPinnedIds);
    
    const updatedConversations = conversations.map(conv =>
      conv.id === conversation.id
        ? { ...conv, isPinned: !conv.isPinned }
        : conv
    );
    
    const sorted = updatedConversations.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.dateModification).getTime() - new Date(a.dateModification).getTime();
    });
    
    setConversations(sorted);
    closeContextMenu();
    
    Alert.alert(
      conversation.isPinned ? "Désépinglé" : "Épinglé",
      conversation.isPinned
        ? `${conversation.titre} a été désépinglé`
        : `${conversation.titre} a été épinglé`
    );
  };

  // Rename conversation - NO validation, accepts any title
 const renameConversation = async () => {
  console.log("=== RENAME FUNCTION STARTED ===");
  console.log("isGuest:", isGuest);
  console.log("selectedConversation:", selectedConversation);
  console.log("newConversationTitle:", newConversationTitle);
  
  if (!selectedConversation) {
    console.log("No selected conversation, exiting");
    setRenameModalVisible(false);
    return;
  }

  const finalTitle = newConversationTitle.trim() || selectedConversation.titre;
  console.log("finalTitle:", finalTitle);

  try {
    const token = await AsyncStorage.getItem("auth_token");
    console.log("Token exists:", !!token);
    
    const url = `${API_URL}/api/chat/conversations/${selectedConversation.id}`;
    console.log("PUT URL:", url);
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ titre: finalTitle }),
    });

    console.log("Response status:", response.status);
    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (response.ok) {
      console.log("Rename successful, updating local state");
      const updatedConversations = conversations.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, titre: finalTitle }
          : conv
      );
      setConversations(updatedConversations);
      setRenameModalVisible(false);
      closeContextMenu();
      Alert.alert("Succès", "Conversation renommée");
    } else {
      Alert.alert("Erreur", `Impossible de renommer: ${response.status}\n${responseText}`);
    }
  } catch (error) {
    console.error("Error renaming conversation:", error);
    Alert.alert("Erreur", "Impossible de renommer la conversation");
  }
};

  const openRenameModal = (conversation: Conversation) => {
  console.log("Opening rename modal for:", conversation.titre);
  setSelectedConversation(conversation);
  setNewConversationTitle(conversation.titre);
  setContextMenuVisible(false);
  setTimeout(() => {
    setRenameModalVisible(true);
  }, 50);
};

  const createNewConversation = async () => {
    // ========== NEW: Clear conversation history when creating new chat ==========
    setConversationHistory([]);
    
    if (isGuest) {
      const guestConversationId = `guest_${Date.now()}`;
      setCurrentConversationId(guestConversationId);
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: welcomeMessages[mode].message,
        sender: "assistant",
        timestamp: new Date(),
        conversationId: guestConversationId,
      };
      setMessages([welcomeMessage]);
      closeSidebar();
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const modeTitle = mode === "debutant" ? "Assistant Débutant" : "Assistant Avancé";
      
      const response = await fetch(`${API_URL}/api/chat/conversations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre: `${modeTitle} - ${new Date().toLocaleDateString()}`,
        }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        setCurrentConversationId(newConversation.id);
        setConversations([{ ...newConversation, isPinned: false }, ...conversations]);
        
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: welcomeMessages[mode].message,
          sender: "assistant",
          timestamp: new Date(),
          conversationId: newConversation.id,
        };
        setMessages([welcomeMessage]);
        
        await sendMessageToBackend(welcomeMessage.text, "assistant", newConversation.id);
        closeSidebar();
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    // ========== NEW: Clear conversation history when loading different conversation ==========
    setConversationHistory([]);
    
    if (isGuest) {
      setMessages([]);
      return;
    }
    
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/api/chat/conversations/${conversationId}/messages`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const loadedMessages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          text: msg.contenu,
          sender: msg.rédacteur === "user" ? "user" : "assistant",
          timestamp: new Date(msg.dateEnvoi),
          conversationId: msg.conversationId,
        }));
        setMessages(loadedMessages);
        
        // ========== NEW: Rebuild conversation history from loaded messages ==========
        const history = loadedMessages.map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        }));
        setConversationHistory(history);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessageToBackend = async (content: string, sender: string, conversationId: string) => {
    if (isGuest) return;
    
    try {
      const token = await AsyncStorage.getItem("auth_token");
      await fetch(`${API_URL}/api/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contenu: content,
          rédacteur: sender,
        }),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const updateConversationTitle = async (conversationId: string, userMessage: string) => {
    if (isGuest) return;
    
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const shortTitle = userMessage.length > 30 ? userMessage.substring(0, 30) + "..." : userMessage;
      
      await fetch(`${API_URL}/api/chat/conversations/${conversationId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre: shortTitle,
        }),
      });
      
      await loadConversations();
    } catch (error) {
      console.error("Error updating conversation title:", error);
    }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setModeModalVisible(false);
    createNewConversation();
  };

  const switchConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
    closeSidebar();
  };

  const deleteConversation = async (conversationId: string, conversationTitle: string) => {
    if (isGuest) {
      Alert.alert("Mode invité", "Connectez-vous pour supprimer des conversations");
      closeContextMenu();
      return;
    }
    
    Alert.alert(
      "Supprimer la conversation",
      `Voulez-vous vraiment supprimer "${conversationTitle}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("auth_token");
              const response = await fetch(`${API_URL}/api/chat/conversations/${conversationId}`, {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`,
                },
              });

              if (response.ok) {
                const pinnedIds = await getPinnedConversations();
                const newPinnedIds = pinnedIds.filter(id => id !== conversationId);
                await savePinnedConversations(newPinnedIds);
                
                const updatedConversations = conversations.filter(c => c.id !== conversationId);
                setConversations(updatedConversations);
                
                if (currentConversationId === conversationId) {
                  if (updatedConversations.length > 0) {
                    await switchConversation(updatedConversations[0].id);
                  } else {
                    await createNewConversation();
                  }
                }
                closeContextMenu();
                Alert.alert("Succès", "Conversation supprimée");
              }
            } catch (error) {
              console.error("Error deleting conversation:", error);
              Alert.alert("Erreur", "Impossible de supprimer la conversation");
            }
          },
        },
      ]
    );
  };

  const showContextMenu = (conversation: Conversation, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setSelectedConversation(conversation);
    setContextMenuVisible(true);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
    setSelectedConversation(null);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
      conversationId: currentConversationId,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userQuestion = inputText;
    setInputText("");
    setIsLoading(true);

    if (!isGuest && currentConversationId) {
      await sendMessageToBackend(userQuestion, "user", currentConversationId);
    }

    const isFirstUserMessage = messages.filter(m => m.sender === "user").length === 0;
    if (!isGuest && isFirstUserMessage && currentConversationId) {
      await updateConversationTitle(currentConversationId, userQuestion);
    }

    try {
      let aiResponseText: string;
      
      // For Débutant mode, use predefined answers if available
      if (mode === "debutant" && predefinedAnswers[userQuestion]) {
        aiResponseText = predefinedAnswers[userQuestion];
      } else {
        // ========== MODIFIED: Pass conversation history to chatbot ==========
        // Convert messages to history format for the Python backend
        const historyForBot = conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        aiResponseText = await callPythonChatbot(userQuestion, mode, currentConversationId, historyForBot);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: "assistant",
        timestamp: new Date(),
        conversationId: currentConversationId,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // ========== NEW: Update conversation history with this exchange ==========
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: userQuestion },
        { role: "assistant", content: aiResponseText }
      ]);
      
      if (!isGuest && currentConversationId) {
        await sendMessageToBackend(aiResponseText, "assistant", currentConversationId);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je n'arrive pas à contacter le serveur. Veuillez réessayer plus tard.",
        sender: "assistant",
        timestamp: new Date(),
        conversationId: currentConversationId,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPredefinedQuestion = async (question: string) => {
    if (!currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: "user",
      timestamp: new Date(),
      conversationId: currentConversationId,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    if (!isGuest && currentConversationId) {
      await sendMessageToBackend(question, "user", currentConversationId);
    }

    const isFirstUserMessage = messages.filter(m => m.sender === "user").length === 0;
    if (!isGuest && isFirstUserMessage && currentConversationId) {
      await updateConversationTitle(currentConversationId, question);
    }

    try {
      let answer: string;
      
      // Use predefined answer if available
      if (predefinedAnswers[question]) {
        answer = predefinedAnswers[question];
      } else {
        answer = await callFaqChatbot(question);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: answer,
        sender: "assistant",
        timestamp: new Date(),
        conversationId: currentConversationId,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // ========== NEW: Update conversation history for beginner mode too ==========
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: answer }
      ]);
      
      if (!isGuest && currentConversationId) {
        await sendMessageToBackend(answer, "assistant", currentConversationId);
      }
    } catch (error) {
      console.error("FAQ error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, une erreur est survenue. Veuillez réessayer.",
        sender: "assistant",
        timestamp: new Date(),
        conversationId: currentConversationId,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View
        key={item.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatarContainer, { backgroundColor: COLORS.assistantMessage }]}>
            <Ionicons name="leaf-outline" size={20} color={COLORS.primary} />
          </View>
        )}
        <View style={[
          styles.messageBubble, 
          isUser ? [styles.userBubble, { backgroundColor: COLORS.userMessage }] : [styles.assistantBubble, { backgroundColor: COLORS.assistantMessage }]
        ]}>
          <Text style={[styles.messageText, isUser ? { color: COLORS.userMessageText } : { color: COLORS.assistantMessageText }]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, { color: COLORS.textSecondary }]}>
            {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </View>
    );
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.sidebarConversationItem,
        currentConversationId === item.id && [styles.sidebarConversationItemActive, { backgroundColor: COLORS.primaryLight }],
      ]}
      onPress={() => switchConversation(item.id)}
      onLongPress={(event) => showContextMenu(item, event)}
      delayLongPress={300}
    >
      <View style={styles.sidebarConversationContent}>
        {item.isPinned && (
          <Ionicons name="pin" size={14} color={COLORS.warning} style={styles.pinIcon} />
        )}
        <Ionicons
          name="chatbubble-outline"
          size={18}
          color={currentConversationId === item.id ? COLORS.primary : COLORS.sidebarText}
        />
        <Text
          style={[
            styles.sidebarConversationTitle,
            { color: currentConversationId === item.id ? COLORS.primary : COLORS.sidebarText },
          ]}
          numberOfLines={1}
        >
          {item.titre}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSuggestedQuestion = ({ item }: { item: string }) => {
    return (
      <TouchableOpacity 
        key={item}
        style={[styles.suggestedButton, { backgroundColor: COLORS.card, borderColor: COLORS.border }]} 
        onPress={() => sendPredefinedQuestion(item)}
        disabled={isLoading}
      >
        <Text style={[styles.suggestedText, { color: COLORS.primary }]}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]}>
        <View style={[styles.header, { backgroundColor: COLORS.card, borderBottomColor: COLORS.border }]}>
          <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
            <Ionicons name="menu-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: COLORS.primary }]}>{welcomeMessages[mode].title}</Text>
            <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>{welcomeMessages[mode].subtitle}</Text>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={styles.modeButton}>
            <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={22} color={COLORS.primary} />
          </TouchableOpacity>
          {!isGuest && (
            <TouchableOpacity style={styles.modeButton} onPress={() => setModeModalVisible(true)}>
              <Ionicons name="swap-horizontal-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          {isGuest && <View style={styles.modeButtonPlaceholder} />}
        </View>

        {isGuest && (
          <View style={[styles.guestBanner, { backgroundColor: COLORS.warning }]}>
            <Ionicons name="information-circle-outline" size={16} color="#fff" />
            <Text style={styles.guestBannerText}>
              Mode invité - Connectez-vous pour sauvegarder vos conversations
            </Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.suggestedContainer}>
          <Text style={[styles.suggestedTitle, { color: COLORS.textSecondary }]}>Questions suggérées :</Text>

          <FlatList
            data={suggestedQuestions[mode]}
            renderItem={renderSuggestedQuestion}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedList}
            
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: COLORS.card, borderTopColor: COLORS.border }]}>
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: COLORS.inputBg, color: COLORS.text },
              mode === "debutant" && { backgroundColor: COLORS.inputDisabledBg }
            ]}
            placeholder={mode === "debutant" ? "Mode débutant - choisissez une question ci-dessus" : "Posez votre question..."}
            placeholderTextColor={COLORS.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={mode === "avance"}
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              { backgroundColor: COLORS.primary },
              (mode === "debutant" || !inputText.trim() || isLoading) && { backgroundColor: COLORS.textSecondary, opacity: 0.5 }
            ]}
            onPress={sendMessage}
            disabled={mode === "debutant" || !inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.card} />
            ) : (
              <Ionicons name="send-outline" size={20} color={COLORS.card} />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {sidebarVisible && (
        <Pressable style={styles.sidebarOverlay} onPress={closeSidebar}>
          <Animated.View
            style={[
              styles.sidebar,
              {
                transform: [{ translateX: sidebarAnim }],
                width: width,
                backgroundColor: COLORS.sidebarBg,
              },
            ]}
          >
            <View style={[styles.sidebarHeader, { borderBottomColor: COLORS.border }]}>
              <View style={styles.sidebarLogo}>
                <Ionicons name="leaf" size={32} color={COLORS.primary} />
                <Text style={[styles.sidebarLogoText, { color: COLORS.primary }]}>MicroVita</Text>
              </View>
              <TouchableOpacity onPress={closeSidebar} style={styles.sidebarCloseButton}>
                <Ionicons name="close-outline" size={24} color={COLORS.sidebarText} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.newChatButton, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary }]} onPress={createNewConversation}>
              <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
              <Text style={[styles.newChatButtonText, { color: COLORS.primary }]}>Nouvelle conversation</Text>
            </TouchableOpacity>

            {!isGuest && (
              <View style={styles.sidebarSection}>
                <Text style={[styles.sidebarSectionTitle, { color: COLORS.textSecondary }]}>Conversations</Text>
                {loadingConversations ? (
                  <ActivityIndicator size="small" color={COLORS.primary} style={styles.sidebarLoader} />
                ) : conversations.length === 0 ? (
                  <View style={styles.sidebarEmpty}>
                    <Text style={[styles.sidebarEmptyText, { color: COLORS.textSecondary }]}>Aucune conversation</Text>
                  </View>
                ) : (
                  <FlatList
                    data={conversations}
                    renderItem={renderConversationItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.sidebarList}
                  />
                )}
              </View>
            )}

            {isGuest && (
              <View style={[styles.guestSidebarPrompt, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="log-in-outline" size={24} color={COLORS.primary} />
                <Text style={[styles.guestSidebarPromptText, { color: COLORS.primary }]}>
                  Connectez-vous pour sauvegarder vos conversations
                </Text>
              </View>
            )}
          </Animated.View>
        </Pressable>
      )}

      <Modal
        visible={contextMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeContextMenu}
      >
        <Pressable style={styles.contextMenuOverlay} onPress={closeContextMenu}>
          <View
            style={[
              styles.contextMenu,
              {
                top: menuPosition.y - 100,
                left: menuPosition.x - 100,
                backgroundColor: COLORS.card,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => selectedConversation && togglePinConversation(selectedConversation)}
            >
              <Ionicons
                name={selectedConversation?.isPinned ? "pin-outline" : "pin"}
                size={20}
                color={COLORS.warning}
              />
              <Text style={[styles.contextMenuItemText, { color: COLORS.text }]}>
                {selectedConversation?.isPinned ? "Désépingler" : "Épingler"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => selectedConversation && openRenameModal(selectedConversation)}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.info} />
              <Text style={[styles.contextMenuItemText, { color: COLORS.text }]}>Renommer</Text>
            </TouchableOpacity>
            <View style={[styles.contextMenuDivider, { backgroundColor: COLORS.border }]} />
            <TouchableOpacity
              style={[styles.contextMenuItem, styles.contextMenuItemDanger]}
              onPress={() => selectedConversation && deleteConversation(selectedConversation.id, selectedConversation.titre)}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              <Text style={[styles.contextMenuItemText, styles.contextMenuItemTextDanger, { color: COLORS.danger }]}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRenameModalVisible(false)}>
          <View style={[styles.renameModalContainer, { backgroundColor: COLORS.card }]}>
            <Text style={[styles.renameModalTitle, { color: COLORS.text }]}>Renommer la conversation</Text>
            <TextInput
              style={[styles.renameInput, { backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }]}
              value={newConversationTitle}
              onChangeText={setNewConversationTitle}
              placeholder="Nouveau titre"
              placeholderTextColor={COLORS.textSecondary}
              autoFocus
            />
            <View style={styles.renameModalButtons}>
              <TouchableOpacity
                style={[styles.renameButton, styles.renameButtonCancel, { backgroundColor: COLORS.bg, borderColor: COLORS.border }]}
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={[styles.renameButtonCancelText, { color: COLORS.textSecondary }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.renameButton, styles.renameButtonSave, { backgroundColor: COLORS.primary }]}
                onPress={renameConversation}
              >
                <Text style={styles.renameButtonSaveText}>Renommer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={modeModalVisible && !isGuest} transparent animationType="fade" onRequestClose={() => setModeModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModeModalVisible(false)}>
          <View style={[styles.modalContainer, { backgroundColor: COLORS.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.text }]}>Changer de mode</Text>
              <TouchableOpacity onPress={() => setModeModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.modeOption, mode === "debutant" && [styles.modeOptionActive, { backgroundColor: COLORS.primaryLight }], { borderBottomColor: COLORS.border }]}
              onPress={() => switchMode("debutant")}
            >
              <View style={styles.modeOptionContent}>
                <View style={[styles.modeIcon, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="leaf-outline" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={[styles.modeName, { color: COLORS.text }]}>Débutant</Text>
                  <Text style={[styles.modeDescription, { color: COLORS.textSecondary }]}>Questions simples et conseils de base</Text>
                </View>
              </View>
              {mode === "debutant" && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeOption, mode === "avance" && [styles.modeOptionActive, { backgroundColor: COLORS.primaryLight }], { borderBottomColor: COLORS.border }]}
              onPress={() => switchMode("avance")}
            >
              <View style={styles.modeOptionContent}>
                <View style={[styles.modeIcon, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="rocket-outline" size={24} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={[styles.modeName, { color: COLORS.text }]}>Avancé</Text>
                  <Text style={[styles.modeDescription, { color: COLORS.textSecondary }]}>Questions techniques, optimisation</Text>
                </View>
              </View>
              {mode === "avance" && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modeButton: {
    padding: 8,
  },
  modeButtonPlaceholder: {
    width: 40,
  },
  guestBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  guestBannerText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  assistantMessageContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  suggestedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  suggestedTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  suggestedList: {
    gap: 8,
  },
  suggestedButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  suggestedText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1001,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  sidebarLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sidebarLogoText: {
    fontSize: 20,
    fontWeight: "700",
  },
  sidebarCloseButton: {
    padding: 8,
  },
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  newChatButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  sidebarSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sidebarSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sidebarList: {
    gap: 4,
  },
  sidebarConversationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sidebarConversationContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  pinIcon: {
    marginRight: -4,
  },
  sidebarConversationTitle: {
    fontSize: 14,
    flex: 1,
  },
  sidebarLoader: {
    marginTop: 20,
  },
  sidebarEmpty: {
    alignItems: "center",
    marginTop: 40,
  },
  sidebarEmptyText: {
    fontSize: 14,
  },
  guestSidebarPrompt: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
  },
  guestSidebarPromptText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
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
  contextMenuDivider: {
    height: 1,
    marginVertical: 4,
  },
  renameModalContainer: {
    borderRadius: 16,
    width: width * 0.85,
    padding: 20,
    alignItems: "center",
  },
  renameModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  renameInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  renameModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  renameButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  renameButtonCancel: {
    borderWidth: 1,
  },
  renameButtonCancelText: {
    fontSize: 15,
    fontWeight: "500",
  },
  renameButtonSaveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 16,
    width: width * 0.85,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modeOptionActive: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  modeOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modeName: {
    fontSize: 16,
    fontWeight: "600",
  },
  modeDescription: {
    fontSize: 12,
    marginTop: 2,
  },
});