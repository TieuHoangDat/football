import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import PlayerItem from "../PlayerItem"; // Import component hiển thị cầu thủ
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const SquadTab = ({ team }) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/players/team/${team.id}`)
      .then((res) => res.json())
      .then((data) => {
        // Lọc cầu thủ có vị trí "Forward"
        const forwards = data.filter((player) => player.position === "Forward");
        setPlayers(forwards);
      })
      .catch((err) => console.error("Lỗi khi lấy danh sách cầu thủ:", err));
  }, [team.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách Forward</Text>
      {players.length === 0 ? (
        <Text style={styles.noData}>Không có cầu thủ nào</Text>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PlayerItem player={item} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  noData: { fontSize: 16, color: "#bbb", textAlign: "center", marginTop: 20 },
});

export default SquadTab;
