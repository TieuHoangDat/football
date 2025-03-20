import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

import IntroductionTab from "../../components/teams/IntroductionTab";
import StatisticsTab from "../../components/teams/StatisticsTab";
import SquadTab from "../../components/teams/SquadTab";

const API_URL = Constants.expoConfig.extra.apiUrl;

const TeamDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { team } = route.params;
  const [activeTab, setActiveTab] = useState("introduction");
  const [followCount, setFollowCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchFollowData = async () => {
      const email = await AsyncStorage.getItem("email");
      if (!email) return;

      try {
        const response = await fetch(`${API_URL}/teams/follow/${team.id}/${email}`);
        const data = await response.json();
        if (response.ok) {
          setFollowCount(data.follow_count);
          setIsFollowing(data.is_following);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu theo dõi:", error);
      }
    };

    fetchFollowData();
  }, [team.id]);

  const handleFollowToggle = async () => {
    const email = await AsyncStorage.getItem("email");
    if (!email) return;

    try {
      const response = await fetch(`${API_URL}/teams/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, team_id: team.id }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsFollowing(data.is_following);
        setFollowCount((prev) => (data.is_following ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật theo dõi:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require("../../assets/arrow-left.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.teamInfo}>
        <Image source={{ uri: `${API_URL}/uploads/teams/${team.image_url}` }} style={styles.teamLogo} />
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamCountry}>{team.country}</Text>

        <View style={styles.followersContainer}>
          <TouchableOpacity onPress={handleFollowToggle}>
            <Image
              source={
                isFollowing
                  ? require("../../assets/like/heart-full.png")
                  : require("../../assets/like/heart.png")
              }
              style={styles.heartIcon}
            />
          </TouchableOpacity>
          <Text style={styles.followers}>{followCount.toLocaleString()} Người theo dõi</Text>
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
      {activeTab === "introduction" && <IntroductionTab team={team} />}
      {activeTab === "statistics" && <StatisticsTab team={team} />}
      {activeTab === "squad" && <SquadTab team={team} />}
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
  heartIcon: { width: 22, height: 22, marginRight: 8 },
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
