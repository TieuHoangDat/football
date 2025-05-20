import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Modal,
    ScrollView,
    Pressable,
    Alert,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import Footer from "../../components/Footer";

const API_URL = Constants.expoConfig.extra.apiUrl;

const UpdateMatchScreen = ({ navigation, route }) => {
    const [matches, setMatches] = useState([]);
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [selectedCompetition, setSelectedCompetition] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [homeScore, setHomeScore] = useState("");
    const [awayScore, setAwayScore] = useState("");
    const [status, setStatus] = useState("scheduled");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showCompetitionFilter, setShowCompetitionFilter] = useState(false);
    const [selectedCompetitionName, setSelectedCompetitionName] =
        useState("Tất cả giải đấu");
    const [statsLoading, setStatsLoading] = useState(false);
    const [homeStats, setHomeStats] = useState({
        possession: "",
        shots: "",
        shots_on_target: "",
        corners: "",
        fouls: "",
        yellow_cards: "",
        red_cards: "",
    });
    const [awayStats, setAwayStats] = useState({
        possession: "",
        shots: "",
        shots_on_target: "",
        corners: "",
        fouls: "",
        yellow_cards: "",
        red_cards: "",
    });
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        filterMatches();
    }, [matches, selectedCompetition, searchQuery]);

    const fetchInitialData = async () => {
        try {
            const [matchesRes, competitionsRes] = await Promise.all([
                axios.get(`${API_URL}/matches/filter`),
                axios.get(`${API_URL}/matches/competitions`),
            ]);

            const unfinishedMatches = matchesRes.data.filter(
                (match) => match.status !== "finished"
            );

            setMatches(unfinishedMatches);
            setFilteredMatches(unfinishedMatches);
            setCompetitions(competitionsRes.data);
        } catch (err) {
            setError("Không thể tải dữ liệu");
        }
    };

    const filterMatches = () => {
        let filtered = [...matches];

        if (selectedCompetition) {
            filtered = filtered.filter(
                (match) => match.competition_id === selectedCompetition
            );
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (match) =>
                    match.home_team_name.toLowerCase().includes(query) ||
                    match.away_team_name.toLowerCase().includes(query) ||
                    match.competition_name.toLowerCase().includes(query)
            );
        }

        setFilteredMatches(filtered);
    };

    const handleCompetitionSelect = (compId, compName) => {
        setSelectedCompetition(compId);
        setSelectedCompetitionName(compName);
        setShowCompetitionFilter(false);
    };

    const handleMatchSelect = async (match) => {
        setSelectedMatch(match);
        setHomeScore(match.home_score?.toString() || "");
        setAwayScore(match.away_score?.toString() || "");
        setStatus(match.status || "scheduled");

        // Mặc định ẩn phần thống kê
        setShowStats(false);
        setStatsLoading(true);

        try {
            // Fetch existing match stats if available
            const response = await axios.get(
                `${API_URL}/matches/${match.id}/stats`
            );
            console.log("Fetched match stats:", response.data);

            if (response.data && response.data.length > 0) {
                const homeTeamStats = response.data.find(
                    (stat) => stat.team_id === match.home_team_id
                );
                const awayTeamStats = response.data.find(
                    (stat) => stat.team_id === match.away_team_id
                );

                if (homeTeamStats) {
                    console.log("Found home team stats:", homeTeamStats);
                    setHomeStats({
                        possession: homeTeamStats.possession?.toString() || "",
                        shots: homeTeamStats.shots?.toString() || "",
                        shots_on_target:
                            homeTeamStats.shots_on_target?.toString() || "",
                        corners: homeTeamStats.corners?.toString() || "",
                        fouls: homeTeamStats.fouls?.toString() || "",
                        yellow_cards:
                            homeTeamStats.yellow_cards?.toString() || "",
                        red_cards: homeTeamStats.red_cards?.toString() || "",
                    });
                }

                if (awayTeamStats) {
                    console.log("Found away team stats:", awayTeamStats);
                    setAwayStats({
                        possession: awayTeamStats.possession?.toString() || "",
                        shots: awayTeamStats.shots?.toString() || "",
                        shots_on_target:
                            awayTeamStats.shots_on_target?.toString() || "",
                        corners: awayTeamStats.corners?.toString() || "",
                        fouls: awayTeamStats.fouls?.toString() || "",
                        yellow_cards:
                            awayTeamStats.yellow_cards?.toString() || "",
                        red_cards: awayTeamStats.red_cards?.toString() || "",
                    });
                }
            } else {
                console.log("No match stats found for matchId:", match.id);
                // Chỉ reset stats nếu chưa có dữ liệu
                if (!homeStats.possession && !homeStats.shots) {
                    setHomeStats({
                        possession: "",
                        shots: "",
                        shots_on_target: "",
                        corners: "",
                        fouls: "",
                        yellow_cards: "",
                        red_cards: "",
                    });
                }
                if (!awayStats.possession && !awayStats.shots) {
                    setAwayStats({
                        possession: "",
                        shots: "",
                        shots_on_target: "",
                        corners: "",
                        fouls: "",
                        yellow_cards: "",
                        red_cards: "",
                    });
                }
            }
        } catch (err) {
            console.error("Error loading match stats:", err);
            // Chỉ reset stats nếu có lỗi và chưa có dữ liệu
            if (!homeStats.possession && !homeStats.shots) {
                setHomeStats({
                    possession: "",
                    shots: "",
                    shots_on_target: "",
                    corners: "",
                    fouls: "",
                    yellow_cards: "",
                    red_cards: "",
                });
            }
            if (!awayStats.possession && !awayStats.shots) {
                setAwayStats({
                    possession: "",
                    shots: "",
                    shots_on_target: "",
                    corners: "",
                    fouls: "",
                    yellow_cards: "",
                    red_cards: "",
                });
            }
        } finally {
            setStatsLoading(false);
        }
    };

    const handleUpdateMatch = async () => {
        if (!selectedMatch) {
            setError("Vui lòng chọn trận đấu");
            return;
        }

        if (homeScore === "" || awayScore === "") {
            setError("Vui lòng nhập tỷ số cho cả hai đội");
            return;
        }

        if (isNaN(homeScore) || isNaN(awayScore)) {
            setError("Tỷ số phải là số");
            return;
        }

        // Validate match stats if they're provided
        if (showStats) {
            if (
                homeStats.possession &&
                (isNaN(homeStats.possession) ||
                    parseFloat(homeStats.possession) < 0 ||
                    parseFloat(homeStats.possession) > 100)
            ) {
                setError(
                    "Tỷ lệ kiểm soát bóng của đội nhà phải là số từ 0-100"
                );
                return;
            }

            if (
                awayStats.possession &&
                (isNaN(awayStats.possession) ||
                    parseFloat(awayStats.possession) < 0 ||
                    parseFloat(awayStats.possession) > 100)
            ) {
                setError(
                    "Tỷ lệ kiểm soát bóng của đội khách phải là số từ 0-100"
                );
                return;
            }
        }

        setLoading(true);
        try {
            console.log("Updating match score:", {
                match_id: selectedMatch.id,
                home_score: parseInt(homeScore),
                away_score: parseInt(awayScore),
                status,
            });

            // Update match score and status
            const matchResponse = await axios.put(
                `${API_URL}/matches/${selectedMatch.id}`,
                {
                    home_score: parseInt(homeScore),
                    away_score: parseInt(awayScore),
                    status: status,
                }
            );

            console.log("Match update response:", matchResponse.data);

            // Luôn cập nhật thống kê, bất kể showStats là true hay false
            // Chỉ cập nhật khi có dữ liệu, nếu không sẽ giữ nguyên giá trị cũ

            console.log("Updating home team stats:", {
                team_id: selectedMatch.home_team_id,
                ...homeStats,
            });

            // Lưu thống kê đội nhà
            const homeStatsResponse = await axios.post(
                `${API_URL}/matches/${selectedMatch.id}/stats`,
                {
                    team_id: selectedMatch.home_team_id,
                    possession: homeStats.possession
                        ? parseFloat(homeStats.possession)
                        : null,
                    shots: homeStats.shots ? parseInt(homeStats.shots) : null,
                    shots_on_target: homeStats.shots_on_target
                        ? parseInt(homeStats.shots_on_target)
                        : null,
                    corners: homeStats.corners
                        ? parseInt(homeStats.corners)
                        : null,
                    fouls: homeStats.fouls ? parseInt(homeStats.fouls) : null,
                    yellow_cards: homeStats.yellow_cards
                        ? parseInt(homeStats.yellow_cards)
                        : null,
                    red_cards: homeStats.red_cards
                        ? parseInt(homeStats.red_cards)
                        : null,
                }
            );

            console.log("Home stats update response:", homeStatsResponse.data);

            console.log("Updating away team stats:", {
                team_id: selectedMatch.away_team_id,
                ...awayStats,
            });

            // Lưu thống kê đội khách
            const awayStatsResponse = await axios.post(
                `${API_URL}/matches/${selectedMatch.id}/stats`,
                {
                    team_id: selectedMatch.away_team_id,
                    possession: awayStats.possession
                        ? parseFloat(awayStats.possession)
                        : null,
                    shots: awayStats.shots ? parseInt(awayStats.shots) : null,
                    shots_on_target: awayStats.shots_on_target
                        ? parseInt(awayStats.shots_on_target)
                        : null,
                    corners: awayStats.corners
                        ? parseInt(awayStats.corners)
                        : null,
                    fouls: awayStats.fouls ? parseInt(awayStats.fouls) : null,
                    yellow_cards: awayStats.yellow_cards
                        ? parseInt(awayStats.yellow_cards)
                        : null,
                    red_cards: awayStats.red_cards
                        ? parseInt(awayStats.red_cards)
                        : null,
                }
            );

            console.log("Away stats update response:", awayStatsResponse.data);

            setSuccess("Cập nhật trận đấu thành công!");
            setError("");

            // Reset và refresh
            setSelectedMatch(null);
            setHomeScore("");
            setAwayScore("");
            setStatus("scheduled");
            setShowStats(false);
            setHomeStats({
                possession: "",
                shots: "",
                shots_on_target: "",
                corners: "",
                fouls: "",
                yellow_cards: "",
                red_cards: "",
            });
            setAwayStats({
                possession: "",
                shots: "",
                shots_on_target: "",
                corners: "",
                fouls: "",
                yellow_cards: "",
                red_cards: "",
            });
            fetchInitialData();
        } catch (err) {
            console.error("Error updating match:", err);
            console.error("Error details:", err.response?.data);
            setError(
                err.response?.data?.message || "Không thể cập nhật trận đấu"
            );
            setSuccess("");
        } finally {
            setLoading(false);
        }
    };

    const renderMatchList = () => (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Manage")}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    Cập nhật kết quả trận đấu
                </Text>
            </View>

            <View style={styles.searchFilterContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm trận đấu..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setShowCompetitionFilter(true)}
                >
                    <Text style={styles.filterButtonText}>
                        {selectedCompetitionName}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.matchList}>
                {filteredMatches.length > 0 ? (
                    filteredMatches.map((match) => (
                        <TouchableOpacity
                            key={match.id}
                            style={styles.matchItem}
                            onPress={() => handleMatchSelect(match)}
                        >
                            <View style={styles.matchHeader}>
                                <Text style={styles.matchDate}>
                                    {new Date(
                                        match.match_date
                                    ).toLocaleDateString()}{" "}
                                    {new Date(
                                        match.match_date
                                    ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Text>
                                <Text style={styles.matchCompetition}>
                                    {match.competition_name}
                                </Text>
                            </View>
                            <View style={styles.matchTeams}>
                                <View style={styles.teamInfo}>
                                    <Image
                                        source={{
                                            uri: `${API_URL}/uploads/teams/${match.home_team_image}`,
                                        }}
                                        style={styles.teamLogo}
                                        defaultSource={require("../../assets/team-placeholder.png")}
                                    />
                                    <Text
                                        style={styles.teamName}
                                        numberOfLines={2}
                                    >
                                        {match.home_team_name}
                                    </Text>
                                </View>

                                <View style={styles.scoreContainer}>
                                    <Text style={styles.vsText}>VS</Text>
                                </View>

                                <View style={styles.teamInfo}>
                                    <Image
                                        source={{
                                            uri: `${API_URL}/uploads/teams/${match.away_team_image}`,
                                        }}
                                        style={styles.teamLogo}
                                        defaultSource={require("../../assets/team-placeholder.png")}
                                    />
                                    <Text
                                        style={styles.teamName}
                                        numberOfLines={2}
                                    >
                                        {match.away_team_name}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noMatchesText}>
                        Không có trận đấu nào
                    </Text>
                )}
            </ScrollView>

            <Modal
                visible={showCompetitionFilter}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCompetitionFilter(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowCompetitionFilter(false)}
                >
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.competitionItem}
                            onPress={() =>
                                handleCompetitionSelect("", "Tất cả giải đấu")
                            }
                        >
                            <Text style={styles.competitionName}>
                                Tất cả giải đấu
                            </Text>
                        </TouchableOpacity>
                        {competitions.map((comp) => (
                            <TouchableOpacity
                                key={comp.id}
                                style={styles.competitionItem}
                                onPress={() =>
                                    handleCompetitionSelect(comp.id, comp.name)
                                }
                            >
                                <Text style={styles.competitionName}>
                                    {comp.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            <Footer />
        </View>
    );

    const renderUpdateForm = () => (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setSelectedMatch(null)}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cập nhật kết quả</Text>
            </View>

            <ScrollView style={styles.updateForm}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {success ? (
                    <Text style={styles.successText}>{success}</Text>
                ) : null}

                <View style={styles.matchInfo}>
                    <Text style={styles.matchTitle}>
                        {selectedMatch.competition_name}
                    </Text>
                    <Text style={styles.matchDate}>
                        {new Date(
                            selectedMatch.match_date
                        ).toLocaleDateString()}
                    </Text>
                </View>

                <View style={styles.scoreContainer}>
                    <View style={styles.teamScoreContainer}>
                        <Image
                            source={{
                                uri: `${API_URL}/uploads/teams/${selectedMatch.home_team_image}`,
                            }}
                            style={styles.updateTeamLogo}
                        />
                        <Text style={styles.teamName} numberOfLines={1}>
                            {selectedMatch.home_team_name}
                        </Text>
                        <TextInput
                            style={styles.scoreInput}
                            value={homeScore}
                            onChangeText={setHomeScore}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <Text style={styles.vsDivider}>-</Text>

                    <View style={styles.teamScoreContainer}>
                        <Image
                            source={{
                                uri: `${API_URL}/uploads/teams/${selectedMatch.away_team_image}`,
                            }}
                            style={styles.updateTeamLogo}
                        />
                        <Text style={styles.teamName} numberOfLines={1}>
                            {selectedMatch.away_team_name}
                        </Text>
                        <TextInput
                            style={styles.scoreInput}
                            value={awayScore}
                            onChangeText={setAwayScore}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#666"
                        />
                    </View>
                </View>

                <Text style={styles.label}>Trạng thái trận đấu</Text>
                <View style={styles.statusContainer}>
                    {["scheduled", "live", "finished"].map((statusOption) => (
                        <TouchableOpacity
                            key={statusOption}
                            style={[
                                styles.statusButton,
                                status === statusOption &&
                                    styles.statusButtonActive,
                            ]}
                            onPress={() => setStatus(statusOption)}
                        >
                            <Text
                                style={[
                                    styles.statusButtonText,
                                    status === statusOption &&
                                        styles.statusButtonTextActive,
                                ]}
                            >
                                {statusOption === "scheduled"
                                    ? "Chưa đấu"
                                    : statusOption === "live"
                                    ? "Đang đấu"
                                    : "Kết thúc"}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.statsToggleContainer}>
                    <TouchableOpacity
                        style={styles.statsToggleButton}
                        onPress={() => setShowStats(!showStats)}
                    >
                        <Text style={styles.statsToggleText}>
                            {showStats
                                ? "Ẩn thống kê trận đấu"
                                : "Hiển thị thống kê trận đấu"}
                        </Text>
                        <Ionicons
                            name={showStats ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>

                {showStats && (
                    <View style={styles.statsContainer}>
                        <Text style={styles.statsTitle}>Thống kê trận đấu</Text>

                        <View style={styles.statsRow}>
                            <Text style={styles.statsLabel}>
                                Kiểm soát bóng (%)
                            </Text>
                            <View style={styles.statsInputContainer}>
                                <TextInput
                                    style={styles.statsInput}
                                    value={homeStats.possession}
                                    onChangeText={(text) =>
                                        setHomeStats({
                                            ...homeStats,
                                            possession: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                                <TextInput
                                    style={styles.statsInput}
                                    value={awayStats.possession}
                                    onChangeText={(text) =>
                                        setAwayStats({
                                            ...awayStats,
                                            possession: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <Text style={styles.statsLabel}>Số cú sút</Text>
                            <View style={styles.statsInputContainer}>
                                <TextInput
                                    style={styles.statsInput}
                                    value={homeStats.shots}
                                    onChangeText={(text) =>
                                        setHomeStats({
                                            ...homeStats,
                                            shots: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                                <TextInput
                                    style={styles.statsInput}
                                    value={awayStats.shots}
                                    onChangeText={(text) =>
                                        setAwayStats({
                                            ...awayStats,
                                            shots: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <Text style={styles.statsLabel}>
                                Sút trúng đích
                            </Text>
                            <View style={styles.statsInputContainer}>
                                <TextInput
                                    style={styles.statsInput}
                                    value={homeStats.shots_on_target}
                                    onChangeText={(text) =>
                                        setHomeStats({
                                            ...homeStats,
                                            shots_on_target: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                                <TextInput
                                    style={styles.statsInput}
                                    value={awayStats.shots_on_target}
                                    onChangeText={(text) =>
                                        setAwayStats({
                                            ...awayStats,
                                            shots_on_target: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <Text style={styles.statsLabel}>Phạt góc</Text>
                            <View style={styles.statsInputContainer}>
                                <TextInput
                                    style={styles.statsInput}
                                    value={homeStats.corners}
                                    onChangeText={(text) =>
                                        setHomeStats({
                                            ...homeStats,
                                            corners: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                                <TextInput
                                    style={styles.statsInput}
                                    value={awayStats.corners}
                                    onChangeText={(text) =>
                                        setAwayStats({
                                            ...awayStats,
                                            corners: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <Text style={styles.statsLabel}>Phạm lỗi</Text>
                            <View style={styles.statsInputContainer}>
                                <TextInput
                                    style={styles.statsInput}
                                    value={homeStats.fouls}
                                    onChangeText={(text) =>
                                        setHomeStats({
                                            ...homeStats,
                                            fouls: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                                <TextInput
                                    style={styles.statsInput}
                                    value={awayStats.fouls}
                                    onChangeText={(text) =>
                                        setAwayStats({
                                            ...awayStats,
                                            fouls: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <Text style={styles.statsLabel}>Thẻ vàng</Text>
                            <View style={styles.statsInputContainer}>
                                <TextInput
                                    style={styles.statsInput}
                                    value={homeStats.yellow_cards}
                                    onChangeText={(text) =>
                                        setHomeStats({
                                            ...homeStats,
                                            yellow_cards: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                                <TextInput
                                    style={styles.statsInput}
                                    value={awayStats.yellow_cards}
                                    onChangeText={(text) =>
                                        setAwayStats({
                                            ...awayStats,
                                            yellow_cards: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <Text style={styles.statsLabel}>Thẻ đỏ</Text>
                            <View style={styles.statsInputContainer}>
                                <TextInput
                                    style={styles.statsInput}
                                    value={homeStats.red_cards}
                                    onChangeText={(text) =>
                                        setHomeStats({
                                            ...homeStats,
                                            red_cards: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                                <TextInput
                                    style={styles.statsInput}
                                    value={awayStats.red_cards}
                                    onChangeText={(text) =>
                                        setAwayStats({
                                            ...awayStats,
                                            red_cards: text,
                                        })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="#666"
                                />
                            </View>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={[
                        styles.updateButton,
                        loading && styles.disabledButton,
                    ]}
                    onPress={handleUpdateMatch}
                    disabled={loading}
                >
                    <Text style={styles.updateButtonText}>
                        {loading ? "Đang cập nhật..." : "Cập nhật kết quả"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <Footer />
        </View>
    );

    return selectedMatch ? renderUpdateForm() : renderMatchList();
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1A1A1A",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        maxWidth: "100vw",
        display: "flex",
        flexDirection: "column",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 18,
        paddingHorizontal: 18,
        backgroundColor: "#232323",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
    },
    headerTitle: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 12,
    },
    searchFilterContainer: {
        padding: 16,
        backgroundColor: "#232323",
        flexDirection: "row",
        gap: 12,
    },
    searchInput: {
        flex: 1,
        backgroundColor: "#2c2c2c",
        color: "#fff",
        padding: 12,
        borderRadius: 6,
        fontSize: 16,
    },
    filterButton: {
        backgroundColor: "#2c2c2c",
        padding: 12,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minWidth: 150,
    },
    filterButtonText: {
        color: "#fff",
        fontSize: 14,
    },
    matchList: {
        flex: 1,
    },
    matchItem: {
        padding: 16,
        backgroundColor: "#232323",
        marginBottom: 1,
    },
    matchHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    matchDate: {
        color: "#888",
        fontSize: 14,
    },
    matchCompetition: {
        color: "#3498db",
        fontSize: 14,
    },
    matchTeams: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    teamInfo: {
        alignItems: "center",
        width: 120,
        flexDirection: "column",
    },
    teamLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        backgroundColor: "#333",
    },
    teamName: {
        color: "#fff",
        fontSize: 14,
        textAlign: "center",
        width: "100%",
    },
    scoreContainer: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    vsText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#232323",
        borderRadius: 8,
        width: "100%",
        maxWidth: 400,
        padding: 8,
    },
    competitionItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    competitionName: {
        color: "#fff",
        fontSize: 16,
    },
    updateForm: {
        flex: 1,
        padding: 20,
        maxWidth: 600,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
    },
    matchInfo: {
        alignItems: "center",
        marginBottom: 24,
    },
    matchTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    scoreContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 20,
        backgroundColor: "#232323",
        padding: 20,
        borderRadius: 8,
    },
    teamScoreContainer: {
        alignItems: "center",
        flex: 1,
        maxWidth: "40%",
    },
    updateTeamLogo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 8,
    },
    scoreInput: {
        backgroundColor: "#2c2c2c",
        color: "#fff",
        fontSize: 24,
        width: 60,
        height: 60,
        textAlign: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#555",
        marginTop: 12,
    },
    vsDivider: {
        color: "#fff",
        fontSize: 24,
        marginHorizontal: 20,
    },
    label: {
        color: "#fff",
        fontSize: 16,
        marginBottom: 10,
        marginTop: 20,
    },
    statusContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        backgroundColor: "#232323",
        padding: 12,
        borderRadius: 8,
    },
    statusButton: {
        flex: 1,
        padding: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#555",
        marginHorizontal: 5,
        alignItems: "center",
    },
    statusButtonActive: {
        backgroundColor: "#3498db",
        borderColor: "#3498db",
    },
    statusButtonText: {
        color: "#fff",
    },
    statusButtonTextActive: {
        fontWeight: "bold",
    },
    updateButton: {
        backgroundColor: "#3498db",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    updateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    disabledButton: {
        opacity: 0.7,
    },
    errorText: {
        color: "#ff6b6b",
        marginBottom: 16,
        textAlign: "center",
        fontSize: 14,
        backgroundColor: "rgba(255, 107, 107, 0.1)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    successText: {
        color: "#51cf66",
        marginBottom: 16,
        textAlign: "center",
        fontSize: 14,
        backgroundColor: "rgba(81, 207, 102, 0.1)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    noMatchesText: {
        color: "#666",
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
        fontStyle: "italic",
    },
    statsToggleContainer: {
        marginTop: 20,
        marginBottom: 10,
    },
    statsToggleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#333",
        padding: 12,
        borderRadius: 8,
    },
    statsToggleText: {
        color: "#fff",
        fontSize: 16,
        marginRight: 8,
    },
    statsContainer: {
        backgroundColor: "#232323",
        padding: 16,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 20,
    },
    statsTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    statsLabel: {
        color: "#fff",
        fontSize: 14,
        flex: 2,
    },
    statsInputContainer: {
        flexDirection: "row",
        flex: 3,
        justifyContent: "space-between",
    },
    statsInput: {
        backgroundColor: "#2c2c2c",
        color: "#fff",
        width: "45%",
        padding: 8,
        borderRadius: 6,
        textAlign: "center",
    },
});

export default UpdateMatchScreen;
