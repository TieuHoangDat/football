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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";
import Footer from "../../components/Footer";

const API_URL = Constants.expoConfig.extra.apiUrl;

const CustomDropdown = ({ value, onChange, items, placeholder }) => {
    const [isVisible, setIsVisible] = useState(false);
    const selectedItem = items.find((item) => item.id === value);

    return (
        <View style={styles.dropdownContainer}>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setIsVisible(true)}
            >
                <Text style={styles.dropdownButtonText}>
                    {selectedItem ? selectedItem.name : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsVisible(false)}
                >
                    <View style={styles.dropdownModal}>
                        <ScrollView style={styles.dropdownScroll}>
                            {items.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.dropdownItem,
                                        value === item.id &&
                                            styles.selectedItem,
                                    ]}
                                    onPress={() => {
                                        onChange(item.id);
                                        setIsVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownItemText,
                                            value === item.id &&
                                                styles.selectedItemText,
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const AddMatchScreen = ({ navigation }) => {
    const [homeTeam, setHomeTeam] = useState("");
    const [awayTeam, setAwayTeam] = useState("");
    const [competition, setCompetition] = useState("");
    const [venue, setVenue] = useState("");
    const [matchDate, setMatchDate] = useState("");
    const [matchTime, setMatchTime] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [teams, setTeams] = useState([]);
    const [competitions, setCompetitions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamsRes, competitionsRes] = await Promise.all([
                    axios.get(`${API_URL}/teams`),
                    axios.get(`${API_URL}/matches/competitions`),
                ]);
                setTeams(teamsRes.data);
                setCompetitions(competitionsRes.data);
            } catch (err) {
                setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            }
        };
        fetchData();
    }, []);

    const renderSelect = (selectedValue, onChange, items, placeholder) => {
        return (
            <CustomDropdown
                value={selectedValue}
                onChange={onChange}
                items={items}
                placeholder={placeholder}
            />
        );
    };

    const validate = () => {
        if (
            !homeTeam ||
            !awayTeam ||
            !competition ||
            !matchDate ||
            !matchTime
        ) {
            setError("Vui lòng điền đầy đủ thông tin các trường bắt buộc");
            setSuccess("");
            return false;
        }
        if (homeTeam === awayTeam) {
            setError("Đội nhà và đội khách không được trùng nhau");
            setSuccess("");
            return false;
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(matchDate)) {
            setError(
                "Ngày thi đấu phải có định dạng YYYY-MM-DD (VD: 2024-05-20)"
            );
            setSuccess("");
            return false;
        }

        // Validate time format (HH:mm)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(matchTime)) {
            setError("Giờ thi đấu phải có định dạng HH:mm (VD: 19:30)");
            setSuccess("");
            return false;
        }

        // Validate if date and time are in the future
        const combinedDateTime = new Date(`${matchDate}T${matchTime}`);
        if (isNaN(combinedDateTime.getTime())) {
            setError("Ngày và giờ thi đấu không hợp lệ");
            setSuccess("");
            return false;
        }

        if (combinedDateTime < new Date()) {
            setError(
                "Ngày và giờ thi đấu không thể là thời điểm trong quá khứ"
            );
            setSuccess("");
            return false;
        }

        setError("");
        return true;
    };

    const handleAddMatch = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            // Combine date and time
            const combinedDateTime = `${matchDate}T${matchTime}`;

            const matchData = {
                home_team_id: parseInt(homeTeam),
                away_team_id: parseInt(awayTeam),
                competition_id: parseInt(competition),
                match_date: new Date(combinedDateTime).toISOString(),
                venue: venue || null,
                status: "scheduled",
            };

            console.log("Sending match data:", matchData);

            const response = await axios.post(`${API_URL}/matches`, matchData);

            if (response.data) {
                setSuccess("Thêm trận đấu thành công!");
                setError("");

                // Reset form
                setHomeTeam("");
                setAwayTeam("");
                setCompetition("");
                setVenue("");
                setMatchDate("");
                setMatchTime("");
            }
        } catch (err) {
            console.error("Error adding match:", err);
            console.error("Error details:", err.response?.data);
            setError(
                err.response?.data?.message ||
                    "Không thể thêm trận đấu. Vui lòng thử lại."
            );
            setSuccess("");
        } finally {
            setLoading(false);
        }
    };

    const isDisabled =
        !homeTeam ||
        !awayTeam ||
        !competition ||
        !matchDate ||
        !matchTime ||
        loading;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Manage")}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thêm Trận Đấu Mới</Text>
            </View>

            <View style={styles.form}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {success ? (
                    <Text style={styles.successText}>{success}</Text>
                ) : null}

                <Text style={styles.label}>Đội nhà *</Text>
                {renderSelect(homeTeam, setHomeTeam, teams, "Chọn đội nhà")}

                <Text style={styles.label}>Đội khách *</Text>
                {renderSelect(awayTeam, setAwayTeam, teams, "Chọn đội khách")}

                <Text style={styles.label}>Giải đấu *</Text>
                {renderSelect(
                    competition,
                    setCompetition,
                    competitions,
                    "Chọn giải đấu"
                )}

                <Text style={styles.label}>Ngày thi đấu * (YYYY-MM-DD)</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        value={matchDate}
                        onChangeText={setMatchDate}
                        placeholder="VD: 2024-05-20"
                        placeholderTextColor="#666"
                    />
                </View>

                <Text style={styles.label}>Giờ thi đấu * (HH:mm)</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        value={matchTime}
                        onChangeText={setMatchTime}
                        placeholder="VD: 19:30"
                        placeholderTextColor="#666"
                    />
                </View>

                <Text style={styles.label}>Sân vận động</Text>
                <View style={styles.inputWrapper}>
                    <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="Nhập tên sân vận động"
                        style={styles.dateTimeInput}
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        isDisabled && styles.disabledButton,
                    ]}
                    onPress={handleAddMatch}
                    disabled={isDisabled}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? "Đang thêm..." : "Lưu Trận Đấu"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Footer />
        </View>
    );
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
    form: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        maxWidth: 600,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
        marginBottom: 80,
        position: "relative",
        overflowY: "auto",
        height: "calc(100vh - 180px)",
        WebkitOverflowScrolling: "touch",
        msOverflowStyle: "-ms-autohiding-scrollbar",
    },
    label: {
        color: "#fff",
        marginBottom: 8,
        marginTop: 16,
        fontSize: 16,
        fontWeight: "500",
    },
    selectWrapper: {
        width: "100%",
        marginBottom: 10,
        position: "relative",
        maxWidth: "100%",
        overflow: "visible",
    },
    select: {
        width: "100%",
        maxWidth: "100%",
        padding: "12px",
        fontSize: 16,
        backgroundColor: "#2c2c2c",
        color: "#fff",
        border: "1px solid #555",
        borderRadius: 6,
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        backgroundImage:
            'url(\'data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>\')',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
        paddingRight: "32px",
        cursor: "pointer",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1,
    },
    "@global": {
        select: {
            position: "relative",
            zIndex: 1,
        },
        "select option": {
            maxWidth: "100vw",
            width: "100%",
            boxSizing: "border-box",
            whiteSpace: "normal",
            wordWrap: "break-word",
            backgroundColor: "#2c2c2c",
            color: "#fff",
            padding: "8px 12px",
        },
        "select:focus": {
            zIndex: 100,
        },
        // Style for the dropdown list
        "select:not([size])": {
            height: "44px",
        },
        // Giới hạn chiều cao của dropdown và thêm scrollbar
        "select[multiple], select[size]": {
            height: "44px",
        },
        // Style cho dropdown menu khi mở
        "select option:checked": {
            backgroundColor: "#3498db",
            color: "#fff",
        },
        // Custom scrollbar styles
        "::-webkit-scrollbar": {
            width: "8px",
        },
        "::-webkit-scrollbar-track": {
            background: "#1a1a1a",
        },
        "::-webkit-scrollbar-thumb": {
            background: "#555",
            borderRadius: "4px",
        },
        "::-webkit-scrollbar-thumb:hover": {
            background: "#666",
        },
    },
    // Thêm style mới để giới hạn chiều cao của dropdown list
    "@media screen and (-webkit-min-device-pixel-ratio:0)": {
        select: {
            height: "44px",
        },
        "select:focus": {
            height: "auto",
        },
        "select option": {
            maxHeight: "300px",
        },
    },
    inputWrapper: {
        width: "100%",
        marginBottom: 15,
        position: "relative",
        maxWidth: "100%",
        overflow: "visible",
        boxSizing: "border-box",
    },
    dateTimeInput: {
        width: "100%",
        maxWidth: "100%",
        padding: "12px",
        fontSize: 16,
        backgroundColor: "#2c2c2c",
        color: "#fff",
        border: "1px solid #555",
        borderRadius: 6,
        outline: "none",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 1,
        minWidth: 0,
        WebkitAppearance: "none",
        MozAppearance: "none",
        appearance: "none",
    },
    saveButton: {
        backgroundColor: "#3498db",
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#888",
        opacity: 0.7,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
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
    input: {
        width: "100%",
        padding: 12,
        fontSize: 16,
        backgroundColor: "#2c2c2c",
        color: "#fff",
        border: "1px solid #555",
        borderRadius: 6,
        outline: "none",
        boxSizing: "border-box",
    },
    dropdownContainer: {
        width: "100%",
        marginBottom: 15,
        position: "relative",
    },
    dropdownButton: {
        backgroundColor: "#2c2c2c",
        padding: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#555",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dropdownButtonText: {
        color: "#fff",
        fontSize: 16,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    dropdownModal: {
        backgroundColor: "#2c2c2c",
        borderRadius: 8,
        width: "100%",
        maxWidth: 600,
        maxHeight: "80%",
        padding: 8,
        borderWidth: 1,
        borderColor: "#555",
    },
    dropdownScroll: {
        width: "100%",
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#444",
    },
    dropdownItemText: {
        color: "#fff",
        fontSize: 16,
    },
    selectedItem: {
        backgroundColor: "#3498db",
    },
    selectedItemText: {
        fontWeight: "bold",
    },
});

export default AddMatchScreen;
