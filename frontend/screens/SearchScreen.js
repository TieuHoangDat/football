import React, { useState } from "react";
import { View, TextInput, FlatList, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig.extra.apiUrl;

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    try {
      // Gửi yêu cầu tìm kiếm đội bóng
      const teamResponse = await fetch(`${API_URL}/teams/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: searchText }),
      });
      const teamData = await teamResponse.json();
      setTeams(teamData);

      // Gửi yêu cầu tìm kiếm cầu thủ
      const playerResponse = await fetch(`${API_URL}/players/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: searchText }),
      });
      const playerData = await playerResponse.json();
      setPlayers(playerData);

    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header với ô tìm kiếm */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/arrow-left.png")} style={styles.icon} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="Nhập từ khoá"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Image source={require("../assets/send.png")} style={styles.sendIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={[{ title: "Đội bóng", data: teams }, { title: "Cầu thủ", data: players }]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            {item.data.length > 0 && (
              <Text style={styles.sectionTitle}>{item.title}</Text>
            )}
            {item.data.map((dataItem) => (
              <TouchableOpacity
                key={dataItem.id}
                style={styles.card}
                onPress={() =>
                  item.title === "Đội bóng"
                    ? navigation.navigate("TeamDetails", { team: dataItem })
                    : navigation.navigate("PlayerDetails", { player: dataItem })
                }
              >
                <Image
                  source={{ uri: `${API_URL}/uploads/${item.title === "Đội bóng" ? "teams" : "players"}/${dataItem.image_url}` }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{dataItem.name || `${dataItem.first_name} ${dataItem.last_name}`}</Text>
                  <Text style={styles.itemSub}>{item.title === "Đội bóng" ? dataItem.country : dataItem.position}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#000", padding: 15, borderBottomWidth: 1, borderBottomColor: "#333" },
  icon: { width: 24, height: 24, tintColor: "#fff", marginRight: 10 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10 },
  input: { flex: 1, color: "#fff", fontSize: 16, paddingVertical: 10 },
  sendIcon: { width: 24, height: 24, tintColor: "#fff" },
  listContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginVertical: 10 },
  card: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#444" },
  itemImage: { width: 50, height: 50, borderRadius: 25 },
  itemInfo: { marginLeft: 10 },
  itemName: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  itemSub: { color: "#bbb" },
});

export default SearchScreen;
