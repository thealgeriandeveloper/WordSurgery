import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";

interface HomeScreenProps {
  onStart: () => void;
  onLanguage: () => void;
  currentLanguage: "fr" | "en";
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onStart,
  onLanguage,
  currentLanguage,
}) => {
  const getStartButtonImage = () => {
    return currentLanguage === "fr"
      ? require("../assets/start_button.png")
      : require("../assets/start_button_en.png"); // ← à ajouter dans ton dossier assets
  };

  const getLanguageButtonImage = () => {
    return currentLanguage === "fr"
      ? require("../assets/language_button.png")
      : require("../assets/language_button_en.png"); // ← idem
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

        <Text style={styles.langText}>
          Langue actuelle :{" "}
          {currentLanguage === "fr" ? "Français 🇫🇷" : "Anglais 🇬🇧"}
        </Text>
      </View>
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
    marginVertical: 15,
  },
  langText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default HomeScreen;
