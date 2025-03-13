import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const SquadTab = ({ team }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đội hình</Text>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  playerName: { fontSize: 16, color: "#fff", marginBottom: 5 },
});

export default SquadTab;
