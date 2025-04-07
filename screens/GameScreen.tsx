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
          clearInterval(id); 
          triggerDefeat();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerId(id); 

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

    let insertionStartIndex = index;
    let insertedIndices: number[] = [];
    for (let i = 0; i < selectedLetters.length; i++) {
      insertedIndices.push(index + i); 
    }

    let [newWord2, gainedPoints] = detectAndRemoveValidWords(
      updatedWord2,
      insertedIndices
    );

    setScore((prev) => prev + gainedPoints);
    if (gainedPoints > 0) {
      setTimeLeft((prev) => Math.min(prev + gainedPoints * 5, 120));
    }

    if (newWord2.length === 0) {
      setShowVictory(true);
      if (timerId) clearInterval(timerId);
      return;
    }

    if (newWord1.length === 0 && newWord2.length > 0) {
      setWord1(" ");
      setWord2(" ");
      setShowDefeat(true);
      if (timerId) clearInterval(timerId);
      return;
    }

    setWord1(newWord1);
    setWord2(newWord2);
    setSelectedIndices([]);
  };

  const detectAndRemoveValidWords = (
    updatedWord2: string,
    insertedIndices: number[]
  ): [string, number] => {
    const foundRanges: [number, number][] = [];
    let points = 0;

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
      <View style={styles.topBar}>
        <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
        <Text style={styles.scoreText}>🏆 {score}</Text>
      </View>
      <TouchableOpacity style={styles.undoButton} onPress={undo}>
        <Text style={styles.undoText}>
          ↩️ {currentLanguage === "fr" ? "Annuler" : "Undo"}
        </Text>
      </TouchableOpacity>
      <View style={styles.zoneTitle}>
        <Text style={styles.zoneText}>
          {currentLanguage === "fr"
            ? "Bloc opératoire : pièces à greffer"
            : "Operating room: parts to graft"}
        </Text>
      </View>
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
      <View style={styles.zoneTitle}>
        <Text style={styles.zoneText}>
          {currentLanguage === "fr" ? "Mot à opérer" : "Word under operation"}
        </Text>
      </View>
      <View style={styles.wordRow}>
        {Array(word2.length + 1)
          .fill(0)
          .map((_, i) => (
            <React.Fragment key={i}>
              <TouchableOpacity
                style={styles.insertSlot}
                onPress={() => handleInsertAt(i)}
              >
                <View style={styles.insertIndicator} />
              </TouchableOpacity>
              {i < word2.length && (
                <View style={styles.letterBox}>
                  <Text style={styles.letter}>{word2[i]}</Text>
                </View>
              )}
            </React.Fragment>
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
  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
  },
  timerText: {
    fontSize: 20,
    color: "#2E2E2E",
  },
  undoButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 40,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topBar: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  zoneTitle: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#333",
    marginTop: 30,
    marginBottom: 10,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  zoneText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  undoText: {
    fontSize: 16,
    fontWeight: "bold",
  },
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
    backgroundColor: "#FFD700", 
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
    backgroundColor: "#fff", 
    borderRadius: 40,
    padding: 10,
    elevation: 5, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  icon: {
    width: 70,
    height: 70,
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
