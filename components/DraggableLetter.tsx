import React from "react";
import { Animated, Text, StyleSheet } from "react-native";

interface DraggableLetterProps {
  letter: string;
  pan: Animated.ValueXY;
  panHandlers: any;
}

const DraggableLetter: React.FC<DraggableLetterProps> = ({
  letter,
  pan,
  panHandlers,
}) => {
  return (
    <Animated.View
      style={[styles.draggable, { transform: pan.getTranslateTransform() }]}
      {...panHandlers}
    >
      <Text style={styles.draggableText}>{letter}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  draggable: {
    position: "absolute",
    top: 250, // Position initiale (à ajuster selon le layout)
    left: 40,
    padding: 10,
    backgroundColor: "#FFF5BB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
    zIndex: 999,
  },
  draggableText: { fontSize: 24 },
});

export default DraggableLetter;
