import React from "react";
import { View, Text, StyleSheet } from "react-native";

const IntroductionTab = ({ team }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.descriptionText}>{team.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  descriptionText: { fontSize: 16, color: "#fff", lineHeight: 24 },
});

export default IntroductionTab;
