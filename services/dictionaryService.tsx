import * as FileSystem from "expo-file-system";

const DICTIONARY_URL =
  "https://raw.githubusercontent.com/Taknok/French-Wordlist/master/francais.txt";
const LOCAL_PATH = FileSystem.documentDirectory + "francais.txt";

export const downloadFrenchDictionary = async (): Promise<void> => {
  const fileInfo = await FileSystem.getInfoAsync(LOCAL_PATH);

  if (!fileInfo.exists) {
    await FileSystem.downloadAsync(DICTIONARY_URL, LOCAL_PATH);
  }
};

export const loadFrenchDictionary = async (): Promise<Set<string>> => {
  try {
    const content = await FileSystem.readAsStringAsync(LOCAL_PATH);
    const words = content.split("\n").map((word) => word.trim().toLowerCase());
    return new Set(words);
  } catch (error) {
    console.error("Erreur de chargement du dictionnaire :", error);
    return new Set();
  }
};
