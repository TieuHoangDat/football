import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";

import IntroductionTab from "../components/teams/IntroductionTab";
import StatisticsTab from "../components/teams/StatisticsTab";
import SquadTab from "../components/teams/SquadTab";

const API_URL = Constants.expoConfig.extra.apiUrl;

const TeamDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { team } = route.params;
  const [activeTab, setActiveTab] = useState("introduction");

  const renderTabContent = () => {
    switch (activeTab) {
      case "statistics":
        return <StatisticsTab team={team} />;
      case "squad":
        return <SquadTab team={team} />;
      default:
        return <IntroductionTab team={team} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../assets/arrow-left.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.teamInfo}>
        <Image source={{ uri: `${API_URL}/uploads/teams/${team.image_url}` }} style={styles.teamLogo} />
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamCountry}>{team.country}</Text>

        <View style={styles.followersContainer}>
          <Image source={require("../assets/heart.png")} style={styles.heartIcon} />
          <Text style={styles.followers}>2,9M Người theo dõi</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab("introduction")}>
          <Text style={[styles.tab, activeTab === "introduction" && styles.activeTab]}>Giới thiệu</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("statistics")}>
          <Text style={[styles.tab, activeTab === "statistics" && styles.activeTab]}>Thống kê</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("squad")}>
          <Text style={[styles.tab, activeTab === "squad" && styles.activeTab]}>Đội hình</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung tab */}
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A1A" },
  header: { padding: 15, flexDirection: "row", alignItems: "center" },
  icon: { width: 24, height: 24, tintColor: "#fff" },
  teamInfo: { alignItems: "center", padding: 20 },
  teamLogo: { width: 80, height: 80, borderRadius: 40 },
  teamName: { fontSize: 22, fontWeight: "bold", color: "#fff", marginTop: 10 },
  teamCountry: { fontSize: 16, color: "#aaa", marginTop: 10, marginBottom: 5 },

  followersContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  heartIcon: { width: 18, height: 18, marginRight: 5 },
  followers: { fontSize: 16, color: "#fff" },

  tabs: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    backgroundColor: "#000", 
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333", 
  },
  tab: { color: "#aaa", fontSize: 16 },
  activeTab: { color: "#fff", fontWeight: "bold", borderBottomWidth: 2, borderBottomColor: "#fff", paddingBottom: 5 },
});

export default TeamDetailsScreen;
