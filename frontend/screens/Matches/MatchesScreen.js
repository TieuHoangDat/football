import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const MatchesScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Trận đấu" />
      <View style={styles.content}>
        <Text style={styles.text}>Danh sách trận đấu</Text>
      </View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    color: "#fff",
  },
});

export default MatchesScreen;
