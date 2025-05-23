import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import TeamItem from "../../components/TeamItem";
import PlayerInfo from "../../components/PlayerInfo"; // Import component mới

const API_URL = Constants.expoConfig.extra.apiUrl;

const calculateAge = (birthDateString) => {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }

  return age;
};

const PlayerDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { player } = route.params;

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/teams/player/${player.id}`)
      .then((response) => response.json())
      .then((data) => {
        setTeams(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách đội bóng:", error);
        setLoading(false);
      });
  }, [player.id]);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../../assets/arrow-left.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Thông tin cầu thủ */}
      <PlayerInfo player={player} teams={teams} />

      {/* Tổng quan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng quan</Text>
        <View style={styles.overviewCard}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Tuổi</Text>
              <Text style={styles.value}>{calculateAge(player.birth_date)}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Quốc tịch</Text>
              <Text style={styles.value}>{player.nationality}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Vị trí</Text>
              <Text style={styles.value}>{player.position}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Số áo</Text>
              <Text style={styles.value}>{player.shirt_number}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Chiều cao</Text>
              <Text style={styles.value}>{player.height}cm</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Cân nặng</Text>
              <Text style={styles.value}>{player.weight}kg</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Danh sách các đội bóng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Các đội bóng đã thi đấu</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : teams.length === 0 ? (
          <Text style={styles.noTeamText}>Chưa có thông tin đội bóng</Text>
        ) : (
          teams.map((team) => <TeamItem key={team.id} team={team} />)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", alignItems: "center", padding: 15 },
  icon: { width: 24, height: 24, tintColor: "#fff" },
  section: { paddingHorizontal: 16, marginTop: 15 },
  sectionTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  overviewCard: { backgroundColor: "#222", borderRadius: 8, padding: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  column: { flex: 1, alignItems: "center" },
  label: { color: "#bbb", fontSize: 20 },
  value: { color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 4 },
});

export default PlayerDetailsScreen;
