import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Button,
  Alert,
} from "react-native";

interface HomeScreenProps {
  onStart: () => void;
  onLanguage: () => void;
  currentLanguage: "fr" | "en";
  onDictionaryLoaded: (words: string[]) => void;
  setLanguage: (lang: "fr" | "en") => void; // 👈 très important
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onStart,
  onLanguage,
  currentLanguage,
  onDictionaryLoaded,
  setLanguage,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const getStartButtonImage = () => {
    return currentLanguage === "fr"
      ? require("../assets/start_button.png")
      : require("../assets/start_button_en.png");
  };

  const getLanguageButtonImage = () => {
    return currentLanguage === "fr"
      ? require("../assets/language_button.png")
      : require("../assets/language_button_en.png");
  };

  const getUploadButtonImage = () => {
    return currentLanguage === "fr"
      ? require("../assets/upload_button.png")
      : require("../assets/upload_button_en.png");
  };

  const handleDownloadDictionary = async () => {
    const url = urlInput.trim();

    if (!url.toLowerCase().endsWith(".txt")) {
      Alert.alert(
        currentLanguage === "fr" ? "Format invalide" : "Invalid format",
        currentLanguage === "fr"
          ? "Le lien doit pointer vers un fichier .txt"
          : "The URL must point to a .txt file"
      );
      return;
    }

    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error("Fichier inaccessible");
      }

      const text = await response.text();

      if (!text) throw new Error("Fichier vide");

      const words = text
        .split("\n")
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length >= 3);

      onDictionaryLoaded(words);
      setIsModalVisible(false);

      Alert.alert("Success", "Dictionary loaded successfully!");

      // 🔁 Attendre légèrement avant de changer la langue
      setTimeout(() => {
        if (currentLanguage === "fr") {
          setLanguage("en");
        }
      }, 200); // ← petit délai de 200ms
    } catch (error) {
      Alert.alert(
        currentLanguage === "fr" ? "Erreur" : "Error",
        currentLanguage === "fr"
          ? "Impossible de charger ce dictionnaire. Vérifie que le lien est correct et accessible."
          : "Failed to load dictionary. Make sure the link is correct and accessible."
      );
    }
  };

  return (
    <ImageBackground
      source={require("../assets/ghibli_background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image
          source={require("../assets/ghibli_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={onStart}>
          <Image
            source={getStartButtonImage()}
            style={styles.buttonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onLanguage}>
          <Image
            source={getLanguageButtonImage()}
            style={styles.buttonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Image
            source={getUploadButtonImage()}
            style={styles.buttonImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.langText}>
          Langue actuelle :{" "}
          {currentLanguage === "fr" ? "Français 🇫🇷" : "English 🇬🇧"}
        </Text>
      </View>

      {/* Modale */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {currentLanguage === "fr"
                ? "Entrer l'URL du dictionnaire (.txt)"
                : "Enter dictionary URL (.txt)"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <Button
                title={currentLanguage === "fr" ? "Annuler" : "Cancel"}
                onPress={() => setIsModalVisible(false)}
              />
              <Button
                title={currentLanguage === "fr" ? "Charger" : "Load"}
                onPress={handleDownloadDictionary}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(242, 231, 201, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  buttonImage: {
    width: "150%",
    height: undefined,
    aspectRatio: 3,
    marginVertical: -40,
  },
  langText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default HomeScreen;
