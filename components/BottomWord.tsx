import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface BottomWordProps {
  word: string;
}

const BottomWord: React.FC<BottomWordProps> = ({ word }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.word}>{word}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    minHeight: 150,
    borderWidth: 2,
    borderColor: "#888",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  word: {
    fontSize: 26,
  },
});

export default BottomWord;
