import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import TeamItem from "../components/TeamItem";
import PlayerItem from "../components/PlayerItem";
import NewsItem from "../components/NewsSearchItem"; // Import component hiển thị tin tức

const API_URL = Constants.expoConfig.extra.apiUrl;

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [news, setNews] = useState([]); // Thêm state lưu danh sách tin tức

  useEffect(() => {
    if (searchText.trim().length === 0) {
      setTeams([]);
      setPlayers([]);
      setNews([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleSearch = async () => {
    try {
      // Gọi API tìm kiếm đội bóng
      const teamResponse = await fetch(`${API_URL}/teams/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: searchText }),
      });
      const teamData = await teamResponse.json();
      setTeams(teamData);

      // Gọi API tìm kiếm cầu thủ
      const playerResponse = await fetch(`${API_URL}/players/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: searchText }),
      });
      const playerData = await playerResponse.json();
      setPlayers(playerData);

      // Gọi API tìm kiếm tin tức
      const newsResponse = await fetch(`${API_URL}/news/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: searchText }),
      });
      const newsData = await newsResponse.json();
      setNews(newsData);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/arrow-left.png")} style={styles.icon} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="Nhập từ khoá..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText} // Tự động tìm kiếm khi nhập
          />
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={[
          { title: "Đội bóng", data: teams, component: TeamItem },
          { title: "Cầu thủ", data: players, component: PlayerItem },
          { title: "Tin tức", data: news, component: NewsItem } // Thêm tin tức
        ]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            {item.data.length > 0 && <Text style={styles.sectionTitle}>{item.title}</Text>}
            {item.data.map((dataItem) => (
              <item.component key={dataItem.id} {...(item.title === "Đội bóng" ? { team: dataItem } : item.title === "Cầu thủ" ? { player: dataItem } : { news: dataItem })} />
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
  listContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginVertical: 10 },
});

export default SearchScreen;
