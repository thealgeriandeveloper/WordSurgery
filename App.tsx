// App.tsx
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Platform } from "react-native";
import { Audio } from "expo-av";

import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import {
  downloadFrenchDictionary,
  loadFrenchDictionary,
} from "./services/dictionaryService";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<
    "home" | "game" | "language"
  >("home");
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const startMusic = async () => {
      try {
        if (Platform.OS === "ios") {
          await Audio.setAudioModeAsync({
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
          });
        }

        const { sound } = await Audio.Sound.createAsync(
          require("./assets/ghibli_music.mp3"),
          { isLooping: true, shouldPlay: true, volume: 0.7 }
        );

        soundRef.current = sound;
        await sound.playAsync();
      } catch (error) {
        console.error("Erreur musique de fond :", error);
      }
    };

    startMusic();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    const loadDictionary = async () => {
      if (language === "fr") {
        await downloadFrenchDictionary();
        const dictSet = await loadFrenchDictionary();
        const filtered = Array.from(dictSet).filter((word) => word.length >= 3);
        setDictionary(filtered);
      } else {
        const response = await fetch(
          "https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words.txt"
        );
        const text = await response.text();
        const words = text
          .split("\n")
          .map((w) => w.trim())
          .filter((w) => w.length >= 3);
        setDictionary(words);
      }
    };

    loadDictionary();
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "fr" ? "en" : "fr"));
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === "home" && (
        <HomeScreen
          onStart={() => setCurrentScreen("game")}
          onLanguage={toggleLanguage}
          currentLanguage={language}
        />
      )}
      {currentScreen === "game" && dictionary.length >= 2 && (
        <GameScreen
          dictionary={dictionary}
          onQuit={() => setCurrentScreen("home")}
          currentLanguage={language}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default App;
