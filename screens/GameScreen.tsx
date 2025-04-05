// screens/GameScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";

interface GameScreenProps {
  dictionary: string[];
  onQuit: () => void;
  currentLanguage: "fr" | "en";
}

interface GameState {
  word1: string;
  word2: string;
  score: number;
}

const GameScreen: React.FC<GameScreenProps> = ({
  dictionary,
  onQuit,
  currentLanguage,
}) => {
  const triggerDefeat = () => {
    console.log("💀 Défaite déclenchée !");
    setShowDefeat(true);
    setWord1(" ");
    setWord2(" ");
  };
  const [isLoading, setIsLoading] = useState(false);
  const [word1, setWord1] = useState<string>("");
  const [word2, setWord2] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [history, setHistory] = useState<GameState[]>([]);

  const saveState = () => {
    setHistory((prev) => [{ word1, word2, score }, ...prev.slice(0, 9)]);
  };

  const undo = () => {
    if (history.length > 0) {
      const prevState = history[0];
      setWord1(prevState.word1);
      setWord2(prevState.word2);
      setScore(prevState.score);
      setSelectedIndices([]);
      setHistory((prev) => prev.slice(1));
    }
  };

  const startNewGame = () => {
    setScore(0);
    setIsLoading(true);
    setSelectedIndices([]);
    setTimeLeft(60);
    setHistory([]);
    setShowVictory(false);
    setShowDefeat(false);

    if (timerId) clearInterval(timerId);

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id); // 🛑 ici on arrête directement ce timer
          triggerDefeat();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerId(id); // stocké si tu veux plus tard

    if (dictionary.length < 2) {
      setIsLoading(false);
      return;
    }

    const index1 = Math.floor(Math.random() * dictionary.length);
    const filtered = dictionary.filter((word) => word.length <= 6);

    if (filtered.length === 0) {
      console.warn(
        "Aucun mot de 6 lettres ou moins trouvé dans le dictionnaire."
      );
      setWord1("ERROR");
      setWord2("WORD");
      setIsLoading(false);
      return;
    }

    let index2 = Math.floor(Math.random() * filtered.length);

    setWord1(dictionary[index1].toUpperCase());
    setWord2(filtered[index2].toUpperCase());
    setIsLoading(false);
  };

  const handleInsertAt = (index: number) => {
    if (selectedIndices.length === 0) return;
    saveState();

    const selectedLetters = selectedIndices.map((i) => word1[i]);
    let updatedWord2 =
      word2.slice(0, index) + selectedLetters.join("") + word2.slice(index);

    const newWord1Array = word1
      .split("")
      .filter((_, i) => !selectedIndices.includes(i));
    const newWord1 = newWord1Array.join("");
    console.log("newWord1:", newWord1);

    let insertionStartIndex = index;
    let insertedIndices: number[] = [];
    for (let i = 0; i < selectedLetters.length; i++) {
      insertedIndices.push(index + i); // index = position d’insertion
    }

    let [newWord2, gainedPoints] = detectAndRemoveValidWords(
      updatedWord2,
      insertedIndices
    );
    console.log("newWord2:", newWord2);

    setScore((prev) => prev + gainedPoints);
    if (gainedPoints > 0) {
      setTimeLeft((prev) => Math.min(prev + gainedPoints * 5, 120));
    }

    // ✅ VICTOIRE ?
    if (newWord2.length === 0) {
      setShowVictory(true);
      if (timerId) clearInterval(timerId);
      return;
    }

    // ✅ DÉFAITE ? (mot 1 vidé, mot 2 non vide)
    if (newWord1.length === 0 && newWord2.length > 0) {
      console.log("🟥 DEFAITE DÉCLENCHÉE");
      setWord1(" ");
      setWord2(" ");
      setShowDefeat(true);
      if (timerId) clearInterval(timerId);
      return;
    }

    // Mise à jour des états
    setWord1(newWord1);
    setWord2(newWord2);
    setSelectedIndices([]);
    //checkIfNoMoreMoves();
  };

  const detectAndRemoveValidWords = (
    updatedWord2: string,
    insertedIndices: number[]
  ): [string, number] => {
    const foundRanges: [number, number][] = [];
    let points = 0;

    // Créer une carte d’origine : "mot1" ou null
    const originMap = updatedWord2
      .split("")
      .map((_, i) => (insertedIndices.includes(i) ? "mot1" : null));

    for (let start = 0; start < updatedWord2.length; start++) {
      for (let end = start + 3; end <= updatedWord2.length; end++) {
        const slice = updatedWord2.slice(start, end);
        const originSlice = originMap.slice(start, end);

        const hasMot1 = originSlice.includes("mot1");

        if (dictionary.includes(slice.toLowerCase()) && hasMot1) {
          foundRanges.push([start, end]);
          points += 1;
        }
      }
    }

    if (foundRanges.length === 0) return [updatedWord2, 0];

    const indexesToRemove = new Set<number>();
    for (const [start, end] of foundRanges) {
      for (let i = start; i < end; i++) {
        indexesToRemove.add(i);
      }
    }

    const cleanedWord2 = updatedWord2
      .split("")
      .filter((_, i) => !indexesToRemove.has(i))
      .join("");

    return [cleanedWord2, points];
  };

  const checkIfNoMoreMoves = () => {
    const letters1 = word1.split("");

    for (let start = 0; start < letters1.length; start++) {
      for (let end = start + 1; end <= letters1.length; end++) {
        const selection = letters1.slice(start, end);
        const fragment = selection.join("").toLowerCase();

        for (let insertPos = 0; insertPos <= word2.length; insertPos++) {
          const testWord =
            word2.slice(0, insertPos) + fragment + word2.slice(insertPos);

          for (let i = 0; i <= testWord.length - 3; i++) {
            for (let j = i + 3; j <= testWord.length; j++) {
              const sub = testWord.slice(i, j).toLowerCase();
              if (dictionary.includes(sub)) {
                return;
              }
            }
          }
        }
      }
    }

    // ✅ Ajout de ta logique personnalisée
    if (word1.length === 0 && word2.length > 0) {
      setShowDefeat(true);
      if (timerId) clearInterval(timerId);
      setIsLoading(false);
    }
  };

  const handleSelectLetter = (index: number) => {
    if (selectedIndices.length === 0) {
      setSelectedIndices([index]);
    } else {
      const min = Math.min(...selectedIndices);
      const max = Math.max(...selectedIndices);

      if (index === min - 1) {
        setSelectedIndices([index, ...selectedIndices]);
      } else if (index === max + 1) {
        setSelectedIndices([...selectedIndices, index]);
      } else {
        setSelectedIndices([index]);
      }
    }
  };

  const handleGoHome = () => {
    setShowModal(true);
  };

  const confirmGoHome = () => {
    setWord1("");
    setWord2("");
    setShowModal(false);
    if (timerId) clearInterval(timerId);
    onQuit();
  };

  const getHomeIcon = () => {
    return currentLanguage === "fr"
      ? require("../assets/home-icon.png")
      : require("../assets/home-icon-en.png");
  };

  useEffect(() => {
    if (dictionary.length >= 2) {
      startNewGame();
    }
  }, [dictionary]);

  /*
  if (isLoading || !word1 || !word2) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Chargement du jeu...</Text>
      </View>
    );
  }*/

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>Score : {score}</Text>
      <Text style={styles.timerText}>⏱️ Temps : {timeLeft}s</Text>
      <TouchableOpacity style={styles.undoButton} onPress={undo}>
        <Text style={styles.undoText}>
          ↩️ {currentLanguage === "fr" ? "Annuler" : "Undo"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.label}>Zone 1 (Mot 1)</Text>
      <View style={styles.wordRow}>
        {word1.split("").map((letter, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.letterBox,
              selectedIndices.includes(index) && styles.selectedLetterBox,
            ]}
            onPress={() => handleSelectLetter(index)}
          >
            <Text style={styles.letter}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Zone 2 (Mot 2)</Text>
      <View style={styles.wordRow}>
        {Array(word2.length + 1)
          .fill(0)
          .map((_, i) => (
            <TouchableOpacity
              key={`insert-${i}`}
              style={styles.insertSlot}
              onPress={() => handleInsertAt(i)}
            >
              <View style={styles.insertIndicator} />
            </TouchableOpacity>
          ))}
      </View>
      <View style={styles.wordRow}>
        {word2.split("").map((letter, index) => (
          <View key={index} style={styles.letterBox}>
            <Text style={styles.letter}>{letter}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
        <Image source={getHomeIcon()} style={styles.icon} />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              {currentLanguage === "fr"
                ? "Es-tu sûr de vouloir quitter la partie ?"
                : "Are you sure you want to quit the game?"}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>
                  {currentLanguage === "fr" ? "Annuler" : "Cancel"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmGoHome}
              >
                <Text style={styles.buttonText}>
                  {currentLanguage === "fr" ? "Quitter" : "Quit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={showVictory} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              {currentLanguage === "fr"
                ? "🎉 Bravo, tu as gagné !"
                : "🎉 Congrats, you won!"}
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                setShowVictory(false);
                startNewGame();
              }}
            >
              <Text style={styles.buttonText}>
                {currentLanguage === "fr" ? "Rejouer" : "Play Again"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showDefeat} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              {currentLanguage === "fr"
                ? "❌ Aucune action possible. Tu as perdu !"
                : "❌ No more possible moves. You lost!"}
            </Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                setShowDefeat(false);
                startNewGame();
              }}
            >
              <Text style={styles.buttonText}>
                {currentLanguage === "fr" ? "Rejouer" : "Play Again"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scoreText: { fontSize: 22, fontWeight: "bold", color: "#2E2E2E" },
  timerText: { fontSize: 20, color: "#333", marginBottom: 10 },
  undoButton: {
    backgroundColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginBottom: 10,
  },
  undoText: { fontSize: 16, fontWeight: "bold" },
  insertSlot: {
    width: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  insertIndicator: {
    width: 6,
    height: 20,
    backgroundColor: "#666",
    borderRadius: 3,
  },
  wordRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
    gap: 5,
    justifyContent: "center",
  },

  letterBox: {
    backgroundColor: "#fff",
    borderColor: "#aaa",
    borderWidth: 1,
    padding: 10,
    minWidth: 40,
    alignItems: "center",
    borderRadius: 5,
  },

  selectedLetterBox: {
    backgroundColor: "#FFD700", // jaune
    borderColor: "#DAA520",
  },

  letter: {
    fontSize: 24,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2E7C9",
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  word: {
    fontSize: 32,
    letterSpacing: 3,
    marginVertical: 10,
    color: "#2E2E2E",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  homeButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 10,
  },
  icon: {
    width: 50,
    height: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  cancelButton: {
    backgroundColor: "#999",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default GameScreen;
