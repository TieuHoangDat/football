import React from "react";
import { View, Text, StyleSheet } from "react-native";

const StatisticsTab = ({ team }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê</Text>
      <Text style={styles.text}>Trận thắng: </Text>
      <Text style={styles.text}>Trận hòa: </Text>
      <Text style={styles.text}>Trận thua: </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  text: { fontSize: 16, color: "#fff", marginBottom: 5 },
});

export default StatisticsTab;
