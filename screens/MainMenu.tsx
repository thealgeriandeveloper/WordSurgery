import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";

interface MainMenuProps {
  onStart: () => void;
  setDictionary: (dict: string) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, setDictionary }) => {
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const handleSelectLanguage = (language: string) => {
    setDictionary(language);
    setLanguageModalVisible(false);
  };

  const handleCustomLanguage = () => {
    if (customUrl.trim() !== "") {
      setDictionary(customUrl.trim());
      setLanguageModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wordsurgery</Text>
      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Démarrer le jeu</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setLanguageModalVisible(true)}
      >
        <Text style={styles.buttonText}>Langue</Text>
      </TouchableOpacity>

      <Modal
        visible={languageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez la langue</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleSelectLanguage("francais")}
            >
              <Text style={styles.modalButtonText}>Français</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleSelectLanguage("anglais")}
            >
              <Text style={styles.modalButtonText}>Anglais</Text>
            </TouchableOpacity>
            <Text style={styles.modalSubtitle}>
              Langue personnalisée (URL du dictionnaire)
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://exemple.com/dictionnaire.json"
              value={customUrl}
              onChangeText={setCustomUrl}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCustomLanguage}
            >
              <Text style={styles.modalButtonText}>Valider</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAF6FA",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#ADD8E6",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#ADD8E6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 5,
    width: "80%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "80%",
    padding: 10,
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: "red",
    fontSize: 16,
  },
});

export default MainMenu;
