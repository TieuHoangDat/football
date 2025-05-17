import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const API_URL = Constants.expoConfig.extra.apiUrl;

const StatsScreen = () => {
  const navigation = useNavigation();
  const [recentMatches, setRecentMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchStats, setMatchStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [competitions, setCompetitions] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    fetchRecentMatches();
    fetchCompetitions();
    fetchSeasons();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchMatchStats(selectedMatch.id);
      fetchMatchPlayers(selectedMatch.id);
    }
  }, [selectedMatch]);

  useEffect(() => {
    if (selectedPlayer && selectedMatch) {
      fetchPlayerStats(selectedPlayer.id, selectedMatch.id);
      setModalVisible(true);
    }
  }, [selectedPlayer]);

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    if (isFiltered && selectedCompetition || selectedSeason) {
      await fetchFilteredMatches();
    } else {
      await fetchRecentMatches();
    }
    setRefreshing(false);
  };

  const fetchCompetitions = async () => {
    try {
      const response = await fetch(`${API_URL}/matches/competitions`);
      
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      setCompetitions(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách giải đấu:", error);
    }
  };

  const fetchSeasons = async () => {
    try {
      const response = await fetch(`${API_URL}/matches/seasons`);
      
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched seasons data:", data);
      
      if (data && Array.isArray(data)) {
        setSeasons(data);
      } else {
        console.error("Dữ liệu mùa giải không hợp lệ:", data);
        setSeasons([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách mùa giải:", error);
      setSeasons([]);
    }
  };

  const fetchFilteredMatches = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/matches/filter?`;
      
      if (selectedCompetition) {
        url += `competition_id=${selectedCompetition}`;
      }
      
      if (selectedSeason) {
        url += `${selectedCompetition ? '&' : ''}season=${selectedSeason}`;
      }
      
      console.log("Calling filter API with URL:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}):`, errorText);
        throw new Error(`Lỗi: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Filtered matches data:", data);
      setRecentMatches(data);
      setLoading(false);
      setIsFiltered(true);
    } catch (error) {
      console.error("Lỗi khi tải trận đấu theo bộ lọc:", error);
      setError("Không thể tải trận đấu theo bộ lọc. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCompetition(null);
    setSelectedSeason(null);
    setIsFiltered(false);
    fetchRecentMatches();
  };

  const fetchRecentMatches = async () => {
    try {
      const response = await fetch(`${API_URL}/matches/recent`);
      
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Recent matches data:", data);
      setRecentMatches(data);
      setLoading(false);
      
      // Nếu đã chọn trận đấu, cập nhật lại thông tin
      if (selectedMatch) {
        const updatedMatch = data.find(match => match.id === selectedMatch.id);
        if (updatedMatch) {
          setSelectedMatch(updatedMatch);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải trận đấu gần đây:", error);
      setError("Không thể tải trận đấu gần đây. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const fetchMatchStats = async (matchId) => {
    try {
      const response = await fetch(`${API_URL}/matches/stats/${matchId}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Match stats data:", data);
      setMatchStats(data);
    } catch (error) {
      console.error("Lỗi khi tải thống kê trận đấu:", error);
      Alert.alert("Lỗi", "Không thể tải thống kê trận đấu. Vui lòng thử lại sau.");
    }
  };

  const fetchMatchPlayers = async (matchId) => {
    try {
      const response = await fetch(`${API_URL}/matches/players/${matchId}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Match players data:", data);
      setPlayers(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách cầu thủ:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách cầu thủ. Vui lòng thử lại sau.");
    }
  };

  const fetchPlayerStats = async (playerId, matchId) => {
    try {
      const response = await fetch(`${API_URL}/matches/player-stats/${matchId}/${playerId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Không tìm thấy thông tin thống kê cho cầu thủ này");
        }
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Player stats data:", data);
      setPlayerStats(data);
    } catch (error) {
      console.error("Lỗi khi tải thống kê cầu thủ:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải thống kê cầu thủ. Vui lòng thử lại sau.");
      setModalVisible(false);
    }
  };

  const navigateToMatchStats = (match) => {
    navigation.navigate('MatchStats', { match });
  };

  const renderMatchItem = ({ item }) => {
    // Định dạng ngày tháng
    const matchDate = new Date(item.match_date);
    const formattedDate = `${matchDate.getDate()}/${matchDate.getMonth() + 1}/${matchDate.getFullYear()}`;
    
    return (
      <TouchableOpacity 
        style={styles.matchItem}
        onPress={() => navigateToMatchStats(item)}
      >
        <View style={styles.matchHeader}>
          <Text style={styles.competitionName}>{item.competition_name}</Text>
          <Text style={styles.matchDate}>{formattedDate}</Text>
        </View>
        
        <View style={styles.matchTeams}>
          <View style={styles.teamInfo}>
            <Image 
              source={{ uri: `${API_URL}/uploads/teams/${item.home_team_image}` }} 
              style={styles.teamLogo} 
            />
            <Text style={styles.teamName}>{item.home_team_name}</Text>
          </View>
          
          <View style={styles.score}>
            <Text style={styles.scoreText}>
              {item.status === 'finished' ? `${item.home_score} - ${item.away_score}` : 'VS'}
            </Text>
            <Text style={styles.statusText}>
              {item.status === 'finished' ? 'Kết thúc' : 
               item.status === 'live' ? 'Đang diễn ra' : 'Sắp diễn ra'}
            </Text>
          </View>
          
          <View style={styles.teamInfo}>
            <Image 
              source={{ uri: `${API_URL}/uploads/teams/${item.away_team_image}` }} 
              style={styles.teamLogo} 
            />
            <Text style={styles.teamName}>{item.away_team_name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPlayerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.playerItem}
      onPress={() => setSelectedPlayer(item)}
    >
      <Image 
        source={{ uri: `${API_URL}/uploads/players/${item.image_url}` }} 
        style={styles.playerImage} 
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.playerPosition}>{item.position}</Text>
      </View>
      <Text style={styles.teamLabel}>{item.team_name}</Text>
    </TouchableOpacity>
  );

  const renderStatsBar = (homeValue, awayValue, label) => {
    const total = homeValue + awayValue;
    const homePercent = total > 0 ? (homeValue / total) * 100 : 50;
    const awayPercent = total > 0 ? (awayValue / total) * 100 : 50;
    
    return (
      <View style={styles.statsRow}>
        <Text style={styles.statsValue}>{homeValue}</Text>
        <View style={styles.statsLabelContainer}>
          <View style={styles.statsBarContainer}>
            <View style={[styles.statsBarHome, { width: `${homePercent}%` }]} />
            <View style={[styles.statsBarAway, { width: `${awayPercent}%` }]} />
          </View>
          <Text style={styles.statsLabel}>{label}</Text>
        </View>
        <Text style={styles.statsValue}>{awayValue}</Text>
      </View>
    );
  };

  const renderStatsSummary = () => {
    if (!matchStats) {
      return (
        <View style={styles.noDataContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.noDataText}>Đang tải thống kê...</Text>
        </View>
      );
    }
    
    if (matchStats.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Không có thống kê cho trận đấu này</Text>
        </View>
      );
    }
    
    const homeStats = matchStats.find(stat => stat.team_id === selectedMatch.home_team_id);
    const awayStats = matchStats.find(stat => stat.team_id === selectedMatch.away_team_id);
    
    if (!homeStats || !awayStats) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Thống kê không đầy đủ</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.teamsHeader}>
          <View style={styles.teamHeaderInfo}>
            <Image 
              source={{ uri: `${API_URL}/uploads/teams/${selectedMatch.home_team_image}` }} 
              style={styles.headerTeamLogo} 
            />
            <Text style={styles.headerTeamName}>{selectedMatch.home_team_name}</Text>
          </View>
          
          <Text style={styles.headerVS}>VS</Text>
          
          <View style={styles.teamHeaderInfo}>
            <Image 
              source={{ uri: `${API_URL}/uploads/teams/${selectedMatch.away_team_image}` }} 
              style={styles.headerTeamLogo} 
            />
            <Text style={styles.headerTeamName}>{selectedMatch.away_team_name}</Text>
          </View>
        </View>
      
        <Text style={styles.statsSectionTitle}>Thống kê trận đấu</Text>
        
        {renderStatsBar(
          Math.round(homeStats.possession), 
          Math.round(awayStats.possession), 
          'Kiểm soát bóng (%)'
        )}
        
        {renderStatsBar(homeStats.shots, awayStats.shots, 'Số cú sút')}
        {renderStatsBar(homeStats.shots_on_target, awayStats.shots_on_target, 'Sút trúng đích')}
        {renderStatsBar(homeStats.corners, awayStats.corners, 'Phạt góc')}
        {renderStatsBar(homeStats.fouls, awayStats.fouls, 'Phạm lỗi')}
        {renderStatsBar(homeStats.yellow_cards, awayStats.yellow_cards, 'Thẻ vàng')}
        {renderStatsBar(homeStats.red_cards, awayStats.red_cards, 'Thẻ đỏ')}
      </View>
    );
  };

  const renderPlayersContent = () => {
    if (players.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Không có dữ liệu cầu thủ cho trận đấu này</Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={players}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.playersList}
      />
    );
  };

  const renderPlayerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
        setSelectedPlayer(null);
        setPlayerStats(null);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => {
              setModalVisible(false);
              setSelectedPlayer(null);
              setPlayerStats(null);
            }}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          
          {selectedPlayer && (
            <View style={styles.modalHeader}>
              <Image 
                source={{ uri: `${API_URL}/uploads/players/${selectedPlayer.image_url}` }} 
                style={styles.modalPlayerImage} 
              />
              <Text style={styles.modalPlayerName}>{selectedPlayer.first_name} {selectedPlayer.last_name}</Text>
              <Text style={styles.modalTeamName}>{selectedPlayer.team_name}</Text>
            </View>
          )}
          
          {playerStats ? (
            <View style={styles.playerStatsContainer}>
              <Text style={styles.playerStatsSectionTitle}>Thống kê trong trận</Text>
              
              <View style={styles.playerStatRow}>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.minutes_played}'</Text>
                  <Text style={styles.playerStatLabel}>Thời gian thi đấu</Text>
                </View>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.goals}</Text>
                  <Text style={styles.playerStatLabel}>Bàn thắng</Text>
                </View>
              </View>
              
              <View style={styles.playerStatRow}>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.assists}</Text>
                  <Text style={styles.playerStatLabel}>Kiến tạo</Text>
                </View>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.shots}</Text>
                  <Text style={styles.playerStatLabel}>Cú sút</Text>
                </View>
              </View>
              
              <View style={styles.playerStatRow}>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.passes}</Text>
                  <Text style={styles.playerStatLabel}>Đường chuyền</Text>
                </View>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.pass_accuracy}%</Text>
                  <Text style={styles.playerStatLabel}>Chính xác</Text>
                </View>
              </View>
              
              <View style={styles.playerStatRow}>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.tackles}</Text>
                  <Text style={styles.playerStatLabel}>Tắc bóng</Text>
                </View>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.interceptions}</Text>
                  <Text style={styles.playerStatLabel}>Cắt bóng</Text>
                </View>
              </View>
              
              <View style={styles.playerStatRow}>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.yellow_cards}</Text>
                  <Text style={styles.playerStatLabel}>Thẻ vàng</Text>
                </View>
                <View style={styles.playerStatItem}>
                  <Text style={styles.playerStatValue}>{playerStats.red_cards}</Text>
                  <Text style={styles.playerStatLabel}>Thẻ đỏ</Text>
                </View>
              </View>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#fff" />
          )}
        </View>
      </View>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lọc trận đấu</Text>
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.filterLabel}>Chọn giải đấu:</Text>
          <ScrollView style={styles.filterOptionsContainer}>
            {competitions && competitions.length > 0 ? competitions.map(competition => (
              <TouchableOpacity
                key={competition.id}
                style={[
                  styles.filterOption,
                  selectedCompetition === competition.id && styles.selectedFilterOption
                ]}
                onPress={() => setSelectedCompetition(
                  selectedCompetition === competition.id ? null : competition.id
                )}
              >
                <View style={styles.filterOptionContent}>
                  {competition.logo_url ? (
                    <Image
                      source={{ uri: competition.logo_url }}
                      style={styles.competitionLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.competitionLogoPlaceholder} />
                  )}
                  <Text style={[
                    styles.filterOptionText,
                    selectedCompetition === competition.id && styles.selectedFilterOptionText
                  ]}>
                    {competition.name}
                  </Text>
                </View>
              </TouchableOpacity>
            )) : (
              <Text style={styles.noDataText}>Không có giải đấu nào</Text>
            )}
          </ScrollView>
          
          <Text style={styles.filterLabel}>Chọn mùa giải:</Text>
          <ScrollView style={styles.filterOptionsContainer}>
            {seasons && seasons.length > 0 ? (
              seasons.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterOption,
                    selectedSeason === item.season && styles.selectedFilterOption
                  ]}
                  onPress={() => setSelectedSeason(
                    selectedSeason === item.season ? null : item.season
                  )}
                >
                  <View style={styles.seasonBadge}>
                    <Text style={[
                      styles.filterOptionText,
                      selectedSeason === item.season && styles.selectedFilterOptionText
                    ]}>
                      {item.season}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>Không có dữ liệu mùa giải</Text>
            )}
          </ScrollView>
          
          <View style={styles.filterSummary}>
            {selectedCompetition && (
              <View style={styles.selectedFilterBadge}>
                <Text style={styles.selectedFilterBadgeText}>
                  {competitions.find(c => c.id === selectedCompetition)?.name || 'Giải đấu đã chọn'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedCompetition(null)}>
                  <Text style={styles.removeBadgeText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedSeason && (
              <View style={styles.selectedFilterBadge}>
                <Text style={styles.selectedFilterBadgeText}>{selectedSeason}</Text>
                <TouchableOpacity onPress={() => setSelectedSeason(null)}>
                  <Text style={styles.removeBadgeText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.resetButton]}
              onPress={clearFilters}
            >
              <Text style={styles.resetButtonText}>Xóa lọc</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.modalButton, 
                styles.applyButton,
                (!selectedCompetition && !selectedSeason) && styles.disabledButton
              ]}
              onPress={() => {
                fetchFilteredMatches();
                setFilterModalVisible(false);
              }}
              disabled={!selectedCompetition && !selectedSeason}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header title="Thống kê trận đấu" />
      
      <View style={styles.filterBar}>
        <Text style={styles.sectionTitle}>Trận đấu gần đây</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={styles.filterButtonText}>
            {isFiltered ? "Đang lọc" : "Lọc"}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={recentMatches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.matchesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Không có trận đấu nào</Text>
            </View>
          }
        />
      )}
      
      {renderFilterModal()}
      
      <Footer activeScreen="stats" />
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
    padding: 10,
  },
  matchesList: {
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    marginLeft: 5,
  },
  matchList: {
    paddingBottom: 20,
  },
  matchItem: {
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
    marginBottom: 15,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  competitionName: {
    color: "#aaa",
    fontSize: 14,
  },
  matchDate: {
    color: "#ccc",
    fontSize: 14,
  },
  matchTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamInfo: {
    alignItems: "center",
    width: 100,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
    backgroundColor: "#333",
  },
  teamName: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  score: {
    alignItems: "center",
  },
  scoreText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  statusText: {
    color: "#ccc",
    fontSize: 12,
  },
  matchDetail: {
    flex: 1,
    marginTop: 15,
    backgroundColor: "#222",
    borderRadius: 10,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
  },
  tabText: {
    color: "#ccc",
    fontSize: 16,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tabContent: {
    padding: 15,
    minHeight: 300,
  },
  teamsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  teamHeaderInfo: {
    alignItems: "center",
    width: "40%",
  },
  headerTeamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    backgroundColor: "#333",
  },
  headerTeamName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerVS: {
    color: "#ccc",
    fontSize: 18,
    fontWeight: "bold",
  },
  statsContainer: {
    marginTop: 10,
  },
  statsSectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statsValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    width: 30,
    textAlign: "center",
  },
  statsLabelContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  statsLabel: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
  statsBarContainer: {
    height: 8,
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
  },
  statsBarHome: {
    height: "100%",
    backgroundColor: "#fff",
  },
  statsBarAway: {
    height: "100%",
    backgroundColor: "#555",
  },
  playersList: {
    flex: 1,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  playerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  playerName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  playerPosition: {
    color: "#ccc",
    fontSize: 14,
  },
  teamLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
    shadowColor: "#ff4d4d",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333',
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
    width: "100%",
  },
  modalPlayerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: "#333",
  },
  modalPlayerName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalTeamName: {
    color: "#1DB954",
    fontSize: 16,
  },
  playerStatsContainer: {
    width: "100%",
  },
  playerStatsSectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  playerStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  playerStatItem: {
    alignItems: "center",
    width: "48%",
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  playerStatValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  playerStatLabel: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 5,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 200,
  },
  noDataText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noMatchesContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    marginBottom: 20,
  },
  noMatchesText: {
    color: "#ccc",
    fontSize: 16,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 5,
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#333',
    paddingLeft: 10,
  },
  filterOptionsContainer: {
    maxHeight: 150,
    marginBottom: 15,
    backgroundColor: '#222',
    borderRadius: 10,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedFilterOption: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#fff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedFilterOptionText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  applyButton: {
    backgroundColor: '#333',
  },
  resetButton: {
    backgroundColor: '#222',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  filterOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  competitionLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  competitionLogoPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: '#333',
    borderRadius: 12,
    marginRight: 12,
  },
  closeModalButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  seasonBadge: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#333",
    alignSelf: 'flex-start',
  },
  filterSummary: {
    flexDirection: "row",
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 15,
    gap: 8,
  },
  selectedFilterBadge: {
    backgroundColor: "rgba(50,50,50,0.9)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    marginRight: 5,
  },
  selectedFilterBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 5,
  },
  removeBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: 'rgba(128,128,128,0.5)',
  },
  resetButtonText: {
    color: "#ccc",
    fontWeight: "bold",
  },
});

export default StatsScreen;
