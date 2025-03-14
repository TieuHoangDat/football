import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const PlayerItem = ({ player }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PlayerDetails", { player })}
    >
      <Image
        source={{ uri: `${API_URL}/uploads/players/${player.image_url}` }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{`${player.first_name} ${player.last_name}`}</Text>
        <Text style={styles.itemSub}>{player.position}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#444" },
  itemImage: { width: 50, height: 50, borderRadius: 25 },
  itemInfo: { marginLeft: 10 },
  itemName: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  itemSub: { color: "#bbb" },
});

export default PlayerItem;
