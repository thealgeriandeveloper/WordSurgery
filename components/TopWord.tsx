import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface TopWordProps {
  word: string;
  selectedIndex: number | null;
  onLetterPress: (index: number) => void;
}

const TopWord: React.FC<TopWordProps> = ({
  word,
  selectedIndex,
  onLetterPress,
}) => {
  return (
    <View style={styles.container}>
      {word.split("").map((letter, index) => {
        const isSelected = selectedIndex === index;
        return (
          <TouchableOpacity key={index} onPress={() => onLetterPress(index)}>
            <Text style={[styles.letter, isSelected && styles.selectedLetter]}>
              {letter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", marginVertical: 10 },
  letter: {
    fontSize: 26,
    marginHorizontal: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  selectedLetter: { backgroundColor: "#ADD8E6" },
});

export default TopWord;
