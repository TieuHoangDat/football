import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
  Modal,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Platform,
  FlatList
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "expo-constants";
import { LinearGradient } from 'expo-linear-gradient';
import Footer from "../../components/Footer";

const API_URL = Constants.expoConfig.extra.apiUrl;
const { width } = Dimensions.get('window');

const MatchStatsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { match } = route.params;
  
  const [activeTab, setActiveTab] = useState('all');
  const [matchStats, setMatchStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);

  useEffect(() => {
    fetchMatchStats();
    fetchMatchPlayers();
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      const homeTeam = players.filter(player => player.team_id === match.home_team_id);
      const awayTeam = players.filter(player => player.team_id === match.away_team_id);
      setHomeTeamPlayers(homeTeam);
      setAwayTeamPlayers(awayTeam);
    }
  }, [players]);

  const fetchMatchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/matches/stats/${match.id}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Match stats data:", data);
      setMatchStats(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải thống kê trận đấu:", error);
      setLoading(false);
    }
  };

  const fetchMatchPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}/matches/players/${match.id}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Match players data:", data);
      setPlayers(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách cầu thủ:", error);
    }
  };

  const fetchPlayerStats = async (playerId) => {
    try {
      const response = await fetch(`${API_URL}/matches/player-stats/${match.id}/${playerId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Không tìm thấy thông tin thống kê cho cầu thủ này");
        }
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Player stats data:", data);
      setPlayerStats(data);
      setModalVisible(true);
    } catch (error) {
      console.error("Lỗi khi tải thống kê cầu thủ:", error);
    }
  };

  const renderStatsItem = (homeValue, label, awayValue) => {
    return (
      <View style={styles.statsRow}>
        <Text style={styles.statValue}>{homeValue}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{awayValue}</Text>
      </View>
    );
  };

  const renderStatsSummary = () => {
    if (!matchStats || matchStats.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Không có thống kê cho trận đấu này</Text>
        </View>
      );
    }
    
    const homeStats = matchStats.find(stat => stat.team_id === match.home_team_id);
    const awayStats = matchStats.find(stat => stat.team_id === match.away_team_id);
    
    if (!homeStats || !awayStats) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Thống kê không đầy đủ</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.statsContainer}>
        {renderStatsItem(
          homeStats.shots_on_target, 
          'Số lần dứt điểm', 
          awayStats.shots_on_target
        )}
        {renderStatsItem(
          homeStats.shots, 
          'Attacks', 
          awayStats.shots
        )}
        {renderStatsItem(
          Math.round(homeStats.possession), 
          'Possession', 
          Math.round(awayStats.possession)
        )}
        {renderStatsItem(
          homeStats.yellow_cards, 
          'Thẻ ', 
          awayStats.yellow_cards
        )}
        {renderStatsItem(
          homeStats.red_cards, 
          'Thẻ ', 
          awayStats.red_cards
        )}
        {renderStatsItem(
          homeStats.corners, 
          'Phạt góc', 
          awayStats.corners
        )}
      </View>
    );
  };

  const renderPlayerItem = (player) => (
    <TouchableOpacity 
      key={player.id}
      style={styles.playerCard}
      onPress={() => {
        setSelectedPlayer(player);
        fetchPlayerStats(player.id);
      }}
    >
      <View style={styles.playerNumberCircle}>
        <Text style={styles.playerNumberText}>{player.shirt_number || '0'}</Text>
      </View>
      <Text style={styles.playerCardName}>{player.first_name} {player.last_name}</Text>
      <Image 
        source={{ uri: `${API_URL}/uploads/teams/${player.team_id === match.home_team_id ? match.home_team_image : match.away_team_image}` }} 
        style={styles.playerCardTeamLogo} 
      />
    </TouchableOpacity>
  );

  const renderPlayersContent = () => {
    if (players.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Không có dữ liệu cầu thủ cho trận đấu này</Text>
        </View>
      );
    }
    
    let playersToRender = [];
    
    if (activeTab === 'all') {
      playersToRender = players;
    } else if (activeTab === 'home') {
      playersToRender = homeTeamPlayers;
    } else if (activeTab === 'away') {
      playersToRender = awayTeamPlayers;
    }
    
    return (
      <View style={styles.playersContainer}>
        <FlatList
          data={playersToRender}
          renderItem={({item}) => renderPlayerItem(item)}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.playersList}
        />
      </View>
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
        <LinearGradient
          colors={['#333333', '#000000']}
          style={styles.modalGradient}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalTopBar}>
              <View style={styles.modalTopBarLine} />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedPlayer(null);
                  setPlayerStats(null);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedPlayer && (
              <View style={styles.modalHeader}>
                <View style={styles.modalPlayerImageContainer}>
                  <Image 
                    source={{ uri: `${API_URL}/uploads/players/${selectedPlayer.image_url}` }} 
                    style={styles.modalPlayerImage} 
                  />
                  <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(0,0,0,0.6)']}
                    style={styles.modalPlayerImageOverlay}
                  />
                </View>
                
                <View style={styles.playerInfoHeader}>
                  <Text style={styles.modalPlayerPosition}>{selectedPlayer.position || 'Cầu thủ'}</Text>
                  <Text style={styles.modalPlayerName}>{selectedPlayer.first_name} {selectedPlayer.last_name}</Text>
                  
                  <View style={styles.playerDetailsRow}>
                    <View style={styles.modalPlayerNumberContainer}>
                      <Text style={styles.modalPlayerNumber}>#{selectedPlayer.shirt_number || '0'}</Text>
                    </View>
                    
                    <View style={styles.teamInfoContainer}>
                      <Image 
                        source={{ uri: `${API_URL}/uploads/teams/${selectedPlayer.team_id === match.home_team_id ? match.home_team_image : match.away_team_image}` }} 
                        style={styles.modalTeamLogo} 
                      />
                      <Text style={styles.modalTeamName}>{selectedPlayer.team_name}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            
            {playerStats ? (
              <ScrollView 
                style={styles.playerStatsContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.playerStatsContent}
              >
                <View style={styles.statsSectionHeader}>
                  <Text style={styles.playerStatsSectionTitle}>Thống kê trận đấu</Text>
                  <View style={styles.sectionHeaderLine} />
                </View>
                
                <View style={styles.keyStatsRow}>
                  <View style={styles.keyStatItem}>
                    <Text style={styles.keyStatValue}>{playerStats.minutes_played}'</Text>
                    <Text style={styles.keyStatLabel}>Phút thi đấu</Text>
                  </View>
                  
                  <View style={[styles.keyStatItem, { backgroundColor: playerStats.goals > 0 ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)' }]}>
                    <Text style={[styles.keyStatValue, { fontSize: 28 }]}>{playerStats.goals}</Text>
                    <Text style={styles.keyStatLabel}>Bàn thắng</Text>
                  </View>
                  
                  <View style={[styles.keyStatItem, { backgroundColor: playerStats.assists > 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)' }]}>
                    <Text style={styles.keyStatValue}>{playerStats.assists}</Text>
                    <Text style={styles.keyStatLabel}>Kiến tạo</Text>
                  </View>
                </View>
                
                <Text style={styles.statsCategoryTitle}>Tấn công</Text>
                <View style={styles.statsBarsContainer}>
                  <View style={styles.statBarItem}>
                    <View style={styles.statBarLabelContainer}>
                      <Text style={styles.statBarLabel}>Sút</Text>
                      <Text style={styles.statBarValue}>{playerStats.shots}</Text>
                    </View>
                    <View style={styles.statBarBackground}>
                      <View style={[styles.statBarFill, { width: `${Math.min(100, playerStats.shots * 10)}%` }]} />
                    </View>
                  </View>
                  
                  <View style={styles.statBarItem}>
                    <View style={styles.statBarLabelContainer}>
                      <Text style={styles.statBarLabel}>Chuyền</Text>
                      <Text style={styles.statBarValue}>{playerStats.passes}</Text>
                    </View>
                    <View style={styles.statBarBackground}>
                      <View style={[styles.statBarFill, { width: `${Math.min(100, playerStats.passes / 2)}%` }]} />
                    </View>
                  </View>
                  
                  <View style={styles.statBarItem}>
                    <View style={styles.statBarLabelContainer}>
                      <Text style={styles.statBarLabel}>Chính xác</Text>
                      <Text style={styles.statBarValue}>{playerStats.pass_accuracy}%</Text>
                    </View>
                    <View style={styles.statBarBackground}>
                      <View style={[styles.statBarFill, { width: `${Math.min(100, playerStats.pass_accuracy)}%` }]} />
                    </View>
                  </View>
                </View>
                
                <Text style={styles.statsCategoryTitle}>Phòng ngự</Text>
                <View style={styles.defenseStatsGrid}>
                  <View style={styles.defenseStatItem}>
                    <View style={styles.defenseStatIconContainer}>
                      <Text style={styles.defenseStatIcon}>T</Text>
                    </View>
                    <View style={styles.defenseStatContent}>
                      <Text style={styles.defenseStatLabel}>Tắc bóng</Text>
                      <Text style={styles.defenseStatValue}>{playerStats.tackles}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.defenseStatItem}>
                    <View style={styles.defenseStatIconContainer}>
                      <Text style={styles.defenseStatIcon}>I</Text>
                    </View>
                    <View style={styles.defenseStatContent}>
                      <Text style={styles.defenseStatLabel}>Cắt bóng</Text>
                      <Text style={styles.defenseStatValue}>{playerStats.interceptions}</Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.statsCategoryTitle}>Kỷ luật</Text>
                <View style={styles.cardsContainer}>
                  {playerStats.yellow_cards > 0 && (
                    <View style={styles.cardItem}>
                      <View style={styles.yellowCard} />
                      <Text style={styles.cardCount}>x{playerStats.yellow_cards}</Text>
                    </View>
                  )}
                  
                  {playerStats.red_cards > 0 && (
                    <View style={styles.cardItem}>
                      <View style={styles.redCard} />
                      <Text style={styles.cardCount}>x{playerStats.red_cards}</Text>
                    </View>
                  )}
                  
                  {playerStats.yellow_cards === 0 && playerStats.red_cards === 0 && (
                    <Text style={styles.noCardsText}>Không có thẻ phạt</Text>
                  )}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Đang tải thống kê...</Text>
              </View>
            )}
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#333333', '#000000']}
        style={styles.headerContainer}
      >
        <Text style={styles.screenTitle}>Match Stats</Text>
        
        <View style={styles.matchInfoContainer}>
          <View style={styles.teamContainer}>
            <Image 
              source={{ uri: `${API_URL}/uploads/teams/${match.home_team_image}` }} 
              style={styles.teamLogo} 
            />
            <Text style={styles.teamName}>{match.home_team_name}</Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {match.status === 'finished' ? 
                `${match.home_score}-${match.away_score}` : 
                'VS'
              }
            </Text>
            <Text style={styles.matchStatus}>
              {match.status === 'finished' ? 'Full-Time' : 
               match.status === 'live' ? 'Live' : 'Upcoming'}
            </Text>
          </View>
          
          <View style={styles.teamContainer}>
            <Image 
              source={{ uri: `${API_URL}/uploads/teams/${match.away_team_image}` }} 
              style={styles.teamLogo} 
            />
            <Text style={styles.teamName}>{match.away_team_name}</Text>
          </View>
        </View>
        
        <Text style={styles.competitionInfo}>{match.competition_name}</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      ) : (
        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.statsSection}>
            {renderStatsSummary()}
          </View>

          <View style={styles.playersSection}>
            <View style={styles.playersHeader}>
              <Text style={styles.playersHeaderText}>Danh sách cầu thủ</Text>
              <View style={styles.playerTabs}>
                <TouchableOpacity 
                  style={[styles.playerTab, activeTab === 'all' && styles.activePlayerTab]} 
                  onPress={() => setActiveTab('all')}
                >
                  <Text style={[styles.playerTabText, activeTab === 'all' && styles.activePlayerTabText]}>All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.playerTab, activeTab === 'home' && styles.activePlayerTab]} 
                  onPress={() => setActiveTab('home')}
                >
                  <Image 
                    source={{ uri: `${API_URL}/uploads/teams/${match.home_team_image}` }} 
                    style={styles.teamTabIcon} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.playerTab, activeTab === 'away' && styles.activePlayerTab]} 
                  onPress={() => setActiveTab('away')}
                >
                  <Image 
                    source={{ uri: `${API_URL}/uploads/teams/${match.away_team_image}` }} 
                    style={styles.teamTabIcon} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {renderPlayersContent()}
          </View>
          {renderPlayerModal()}
        </ScrollView>
      )}
      
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  headerContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  screenTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  matchInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamContainer: {
    alignItems: 'center',
    width: '30%',
  },
  teamLogo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  teamName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  matchStatus: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
  },
  competitionInfo: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  statsContainer: {
    padding: 20,
    marginTop: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  playersHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  playersHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  playerTabs: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    marginBottom: 20,
  },
  playerTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  activePlayerTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  playerTabText: {
    color: '#aaa',
    fontSize: 16,
  },
  activePlayerTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  teamTabIcon: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  playersContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  playersList: {
    paddingBottom: 30,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  playerNumberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  playerNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerCardName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  playerCardTeamLogo: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  noDataText: {
    color: '#aaa',
    fontSize: 16,
  },
  loader: {
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalGradient: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTopBarLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#333',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalPlayerImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(51, 51, 51, 0.5)',
    marginBottom: 15,
  },
  modalPlayerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  modalPlayerImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  playerInfoHeader: {
    alignItems: 'center',
  },
  modalPlayerPosition: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalPlayerName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  playerDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalPlayerNumberContainer: {
    backgroundColor: '#444',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 10,
  },
  modalPlayerNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTeamLogo: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginRight: 5,
  },
  modalTeamName: {
    color: '#ccc',
    fontSize: 16,
  },
  playerStatsContainer: {
    flex: 1,
  },
  playerStatsContent: {
    paddingBottom: 30,
  },
  statsSectionHeader: {
    padding: 20,
    marginBottom: 20,
  },
  playerStatsSectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionHeaderLine: {
    height: 2,
    backgroundColor: '#333',
  },
  keyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  keyStatItem: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  keyStatValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  keyStatLabel: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  statsCategoryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsBarsContainer: {
    marginBottom: 20,
  },
  statBarItem: {
    marginBottom: 10,
  },
  statBarLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBarLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  statBarBackground: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
  },
  statBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 20,
  },
  statBarValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  defenseStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  defenseStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 10,
    width: '48%',
  },
  defenseStatIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  defenseStatIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  defenseStatContent: {
    flex: 1,
  },
  defenseStatLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  defenseStatValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardsContainer: {
    marginBottom: 20,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  yellowCard: {
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#ffd700',
    marginRight: 5,
  },
  redCard: {
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#ff0000',
    marginRight: 5,
  },
  cardCount: {
    color: '#fff',
    fontSize: 14,
  },
  noCardsText: {
    color: '#aaa',
    fontSize: 14,
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
  contentContainer: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  playersSection: {
    flex: 1,
  },
});

export default MatchStatsScreen; 