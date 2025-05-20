const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * API lấy danh sách giải đấu
 * Trả về tất cả các giải đấu có trong hệ thống
 */
router.get("/competitions", (req, res) => {
    const query = `
    SELECT id, name, country, 
           IFNULL(logo_url, '') AS logo_url
    FROM competitions
    ORDER BY name
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn danh sách giải đấu:", err);

            // Nếu lỗi liên quan đến cột logo_url, thử câu truy vấn thay thế
            if (
                err.code === "ER_BAD_FIELD_ERROR" &&
                err.sqlMessage &&
                err.sqlMessage.includes("logo_url")
            ) {
                const fallbackQuery = `
          SELECT id, name, country, '' AS logo_url
          FROM competitions
          ORDER BY name
        `;

                db.query(fallbackQuery, (fallbackErr, fallbackResults) => {
                    if (fallbackErr) {
                        console.error(
                            "Lỗi truy vấn thay thế danh sách giải đấu:",
                            fallbackErr
                        );
                        return res
                            .status(500)
                            .json({ error: "Lỗi khi lấy danh sách giải đấu" });
                    }
                    res.json(fallbackResults);
                });
                return;
            }

            return res
                .status(500)
                .json({ error: "Lỗi khi lấy danh sách giải đấu" });
        }
        res.json(results);
    });
});

/**
 * API lấy danh sách mùa giải
 * Trả về tất cả các mùa giải có trong hệ thống
 */
router.get("/seasons", (req, res) => {
    const query = `
    SELECT DISTINCT season
    FROM competitions
    ORDER BY season DESC
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn danh sách mùa giải:", err);
            return res
                .status(500)
                .json({ error: "Lỗi khi lấy danh sách mùa giải" });
        }

        // Debug log
        console.log("Seasons API response:", results);

        // Đảm bảo kết quả trả về là một mảng các đối tượng có thuộc tính season
        res.json(results);
    });
});

/**
 * API lấy danh sách trận đấu theo bộ lọc
 * Trả về các trận đấu theo giải đấu và mùa giải được chọn
 */
router.get("/filter", (req, res) => {
    const { competition_id, season } = req.query;

    let query = `
    SELECT 
      m.id, m.home_team_id, m.away_team_id, m.match_date, m.venue, 
      m.home_score, m.away_score, m.status, m.competition_id,
      ht.name as home_team_name, ht.image_url as home_team_image,
      at.name as away_team_name, at.image_url as away_team_image,
      c.name as competition_name, c.season
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    JOIN competitions c ON m.competition_id = c.id
    WHERE 1=1
  `;

    const params = [];

    if (competition_id) {
        query += ` AND m.competition_id = ?`;
        params.push(competition_id);
    }

    if (season) {
        query += ` AND c.season = ?`;
        params.push(season);
    }

    query += ` ORDER BY m.match_date DESC LIMIT 30`;

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn trận đấu theo bộ lọc:", err);
            return res
                .status(500)
                .json({ error: "Lỗi khi lấy danh sách trận đấu theo bộ lọc" });
        }
        res.json(results);
    });
});

/**
 * API lấy danh sách trận đấu gần đây
 * Trả về 10 trận đấu gần nhất, bao gồm thông tin về đội bóng và giải đấu
 */
router.get("/recent", (req, res) => {
    const query = `
    SELECT 
      m.id, m.home_team_id, m.away_team_id, m.match_date, m.venue, 
      m.home_score, m.away_score, m.status, m.competition_id,
      ht.name as home_team_name, ht.image_url as home_team_image,
      at.name as away_team_name, at.image_url as away_team_image,
      c.name as competition_name, c.season
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    JOIN competitions c ON m.competition_id = c.id
    ORDER BY m.match_date DESC
    LIMIT 10
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn trận đấu gần đây:", err);
            return res
                .status(500)
                .json({ error: "Lỗi khi lấy danh sách trận đấu gần đây" });
        }
        res.json(results);
    });
});

/**
 * API lấy thống kê của trận đấu
 * Trả về thống kê của cả hai đội trong trận đấu
 */
router.get("/stats/:matchId", (req, res) => {
    const { matchId } = req.params;

    const query = `
    SELECT *
    FROM match_stats
    WHERE match_id = ?
  `;

    db.query(query, [matchId], (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn thống kê trận đấu:", err);
            return res
                .status(500)
                .json({ error: "Lỗi khi lấy thống kê trận đấu" });
        }
        res.json(results);
    });
});

/**
 * API lấy thống kê trận đấu theo định dạng mới
 * Endpoint này phù hợp với cách gọi API từ frontend
 */
router.get("/:matchId/stats", (req, res) => {
    const { matchId } = req.params;

    const query = `
    SELECT *
    FROM match_stats
    WHERE match_id = ?
  `;

    db.query(query, [matchId], (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn thống kê trận đấu:", err);
            return res
                .status(500)
                .json({ error: "Lỗi khi lấy thống kê trận đấu" });
        }
        res.json(results);
    });
});

/**
 * API cập nhật hoặc thêm mới thống kê trận đấu
 */
router.post("/:matchId/stats", (req, res) => {
    const { matchId } = req.params;
    const {
        team_id,
        possession,
        shots,
        shots_on_target,
        corners,
        fouls,
        yellow_cards,
        red_cards,
    } = req.body;

    if (!team_id) {
        return res.status(400).json({
            message: "Thiếu thông tin đội bóng (team_id)",
        });
    }

    // Kiểm tra xem trận đấu có tồn tại không
    const matchCheckQuery = `SELECT id FROM matches WHERE id = ?`;
    db.query(matchCheckQuery, [matchId], (err, matchResults) => {
        if (err) {
            console.error("Lỗi kiểm tra trận đấu:", err);
            return res.status(500).json({
                error: "Lỗi khi kiểm tra trận đấu",
            });
        }

        if (matchResults.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy trận đấu",
            });
        }

        // Kiểm tra xem đội bóng có tồn tại không
        const teamCheckQuery = `SELECT id FROM teams WHERE id = ?`;
        db.query(teamCheckQuery, [team_id], (err, teamResults) => {
            if (err) {
                console.error("Lỗi kiểm tra đội bóng:", err);
                return res.status(500).json({
                    error: "Lỗi khi kiểm tra đội bóng",
                });
            }

            if (teamResults.length === 0) {
                return res.status(404).json({
                    message: "Không tìm thấy đội bóng",
                });
            }

            // Kiểm tra xem thông tin thống kê đã tồn tại chưa
            const checkQuery = `
            SELECT * FROM match_stats
            WHERE match_id = ? AND team_id = ?
            `;

            db.query(checkQuery, [matchId, team_id], (err, results) => {
                if (err) {
                    console.error("Lỗi kiểm tra thống kê trận đấu:", err);
                    return res.status(500).json({
                        error: "Lỗi khi kiểm tra thống kê trận đấu",
                    });
                }

                // Chuẩn bị dữ liệu để tránh lỗi SQL
                // Nếu đã có dữ liệu cũ và giá trị mới là null, giữ nguyên giá trị cũ
                let possessionValue,
                    shotsValue,
                    shotsOnTargetValue,
                    cornersValue,
                    foulsValue,
                    yellowCardsValue,
                    redCardsValue;

                if (results.length > 0) {
                    // Có dữ liệu cũ, chỉ cập nhật nếu giá trị mới không phải null
                    const existingStats = results[0];
                    possessionValue =
                        possession !== undefined &&
                        possession !== null &&
                        possession !== ""
                            ? parseFloat(possession)
                            : existingStats.possession;

                    shotsValue =
                        shots !== undefined && shots !== null && shots !== ""
                            ? parseInt(shots)
                            : existingStats.shots;

                    shotsOnTargetValue =
                        shots_on_target !== undefined &&
                        shots_on_target !== null &&
                        shots_on_target !== ""
                            ? parseInt(shots_on_target)
                            : existingStats.shots_on_target;

                    cornersValue =
                        corners !== undefined &&
                        corners !== null &&
                        corners !== ""
                            ? parseInt(corners)
                            : existingStats.corners;

                    foulsValue =
                        fouls !== undefined && fouls !== null && fouls !== ""
                            ? parseInt(fouls)
                            : existingStats.fouls;

                    yellowCardsValue =
                        yellow_cards !== undefined &&
                        yellow_cards !== null &&
                        yellow_cards !== ""
                            ? parseInt(yellow_cards)
                            : existingStats.yellow_cards;

                    redCardsValue =
                        red_cards !== undefined &&
                        red_cards !== null &&
                        red_cards !== ""
                            ? parseInt(red_cards)
                            : existingStats.red_cards;
                } else {
                    // Không có dữ liệu cũ, chỉ cập nhật với giá trị mới
                    possessionValue =
                        possession !== undefined &&
                        possession !== null &&
                        possession !== ""
                            ? parseFloat(possession)
                            : null;

                    shotsValue =
                        shots !== undefined && shots !== null && shots !== ""
                            ? parseInt(shots)
                            : null;

                    shotsOnTargetValue =
                        shots_on_target !== undefined &&
                        shots_on_target !== null &&
                        shots_on_target !== ""
                            ? parseInt(shots_on_target)
                            : null;

                    cornersValue =
                        corners !== undefined &&
                        corners !== null &&
                        corners !== ""
                            ? parseInt(corners)
                            : null;

                    foulsValue =
                        fouls !== undefined && fouls !== null && fouls !== ""
                            ? parseInt(fouls)
                            : null;

                    yellowCardsValue =
                        yellow_cards !== undefined &&
                        yellow_cards !== null &&
                        yellow_cards !== ""
                            ? parseInt(yellow_cards)
                            : null;

                    redCardsValue =
                        red_cards !== undefined &&
                        red_cards !== null &&
                        red_cards !== ""
                            ? parseInt(red_cards)
                            : null;
                }

                console.log("Received stat values:", {
                    matchId,
                    team_id,
                    possession,
                    shots,
                    shots_on_target,
                    corners,
                    fouls,
                    yellow_cards,
                    red_cards,
                });

                console.log("Processed stat values:", {
                    matchId,
                    team_id,
                    possessionValue,
                    shotsValue,
                    shotsOnTargetValue,
                    cornersValue,
                    foulsValue,
                    yellowCardsValue,
                    redCardsValue,
                });

                // Nếu đã tồn tại, cập nhật thông tin
                if (results.length > 0) {
                    const updateQuery = `
                    UPDATE match_stats
                    SET 
                        possession = ?,
                        shots = ?,
                        shots_on_target = ?,
                        corners = ?,
                        fouls = ?,
                        yellow_cards = ?,
                        red_cards = ?
                    WHERE match_id = ? AND team_id = ?
                    `;

                    db.query(
                        updateQuery,
                        [
                            possessionValue,
                            shotsValue,
                            shotsOnTargetValue,
                            cornersValue,
                            foulsValue,
                            yellowCardsValue,
                            redCardsValue,
                            matchId,
                            team_id,
                        ],
                        (err, result) => {
                            if (err) {
                                console.error(
                                    "Lỗi cập nhật thống kê trận đấu:",
                                    err
                                );
                                return res.status(500).json({
                                    error: "Lỗi khi cập nhật thống kê trận đấu",
                                });
                            }

                            return res.json({
                                message:
                                    "Cập nhật thống kê trận đấu thành công",
                            });
                        }
                    );
                } else {
                    // Nếu chưa tồn tại, thêm mới
                    const insertQuery = `
                    INSERT INTO match_stats 
                    (match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    db.query(
                        insertQuery,
                        [
                            matchId,
                            team_id,
                            possessionValue,
                            shotsValue,
                            shotsOnTargetValue,
                            cornersValue,
                            foulsValue,
                            yellowCardsValue,
                            redCardsValue,
                        ],
                        (err, result) => {
                            if (err) {
                                console.error(
                                    "Lỗi thêm mới thống kê trận đấu:",
                                    err
                                );
                                return res.status(500).json({
                                    error: "Lỗi khi thêm mới thống kê trận đấu",
                                });
                            }

                            return res.status(201).json({
                                message:
                                    "Thêm mới thống kê trận đấu thành công",
                                id: result.insertId,
                            });
                        }
                    );
                }
            });
        });
    });
});

/**
 * API lấy danh sách cầu thủ tham gia trận đấu
 * Trả về thông tin cầu thủ của cả hai đội
 */
router.get("/players/:matchId", (req, res) => {
    const { matchId } = req.params;

    const query = `
    SELECT 
      p.id, p.first_name, p.last_name, p.image_url, p.position, p.shirt_number,
      t.id as team_id, t.name as team_name
    FROM player_match_stats pms
    JOIN players p ON pms.player_id = p.id
    JOIN teams t ON pms.team_id = t.id
    WHERE pms.match_id = ?
    ORDER BY pms.team_id, p.position, p.first_name
  `;

    db.query(query, [matchId], (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn cầu thủ tham gia trận đấu:", err);
            return res.status(500).json({
                error: "Lỗi khi lấy danh sách cầu thủ tham gia trận đấu",
            });
        }
        res.json(results);
    });
});

/**
 * API lấy thống kê cầu thủ trong trận đấu
 * Trả về chi tiết thống kê của một cầu thủ cụ thể trong trận đấu
 */
router.get("/player-stats/:matchId/:playerId", (req, res) => {
    const { matchId, playerId } = req.params;

    const query = `
    SELECT *
    FROM player_match_stats
    WHERE match_id = ? AND player_id = ?
  `;

    db.query(query, [matchId, playerId], (err, results) => {
        if (err) {
            console.error("Lỗi truy vấn thống kê cầu thủ:", err);
            return res
                .status(500)
                .json({ error: "Lỗi khi lấy thống kê cầu thủ" });
        }

        if (results.length === 0) {
            return res
                .status(404)
                .json({ error: "Không tìm thấy thông tin thống kê" });
        }

        res.json(results[0]);
    });
});

/**
 * API thêm trận đấu mới
 */
router.post("/", (req, res) => {
    const {
        home_team_id,
        away_team_id,
        competition_id,
        match_date,
        venue,
        status,
    } = req.body;

    // console.log("Received match data:", req.body);

    // Validate required fields
    if (!home_team_id || !away_team_id || !competition_id || !match_date) {
        console.log("Missing required fields");
        return res.status(400).json({
            message: "Vui lòng điền đầy đủ thông tin các trường bắt buộc",
        });
    }

    // Validate teams are different
    if (home_team_id === away_team_id) {
        console.log("Same teams selected");
        return res.status(400).json({
            message: "Đội nhà và đội khách không được trùng nhau",
        });
    }

    // Validate and format match date
    const matchDate = new Date(match_date);
    if (isNaN(matchDate.getTime())) {
        console.log("Invalid match date");
        return res.status(400).json({
            message: "Ngày thi đấu không hợp lệ",
        });
    }

    // Convert to MySQL datetime format
    const formattedDate = matchDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

    // Validate teams exist
    const validateTeamsQuery = `
        SELECT id FROM teams 
        WHERE id IN (?, ?)
    `;

    db.query(
        validateTeamsQuery,
        [home_team_id, away_team_id],
        (err, teamResults) => {
            if (err) {
                console.error("Error validating teams:", err);
                return res.status(500).json({
                    message: "Lỗi khi kiểm tra thông tin đội bóng",
                });
            }

            if (teamResults.length !== 2) {
                return res.status(400).json({
                    message: "Một hoặc cả hai đội bóng không tồn tại",
                });
            }

            // Validate competition exists
            const validateCompQuery = `
            SELECT id FROM competitions 
            WHERE id = ?
        `;

            db.query(
                validateCompQuery,
                [competition_id],
                (err, compResults) => {
                    if (err) {
                        console.error("Error validating competition:", err);
                        return res.status(500).json({
                            message: "Lỗi khi kiểm tra thông tin giải đấu",
                        });
                    }

                    if (compResults.length === 0) {
                        return res.status(400).json({
                            message: "Giải đấu không tồn tại",
                        });
                    }

                    // All validations passed, insert the match
                    const insertQuery = `
                INSERT INTO matches 
                (home_team_id, away_team_id, competition_id, match_date, venue, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

                    console.log("Formatted date:", formattedDate); // Debug log

                    db.query(
                        insertQuery,
                        [
                            home_team_id,
                            away_team_id,
                            competition_id,
                            formattedDate,
                            venue,
                            status || "scheduled",
                        ],
                        (err, result) => {
                            if (err) {
                                console.error("Error inserting match:", err);
                                return res.status(500).json({
                                    message:
                                        "Không thể thêm trận đấu. Vui lòng thử lại.",
                                    error: err.message,
                                });
                            }

                            res.status(201).json({
                                message: "Thêm trận đấu thành công",
                                match_id: result.insertId,
                            });
                        }
                    );
                }
            );
        }
    );
});

/**
 * API cập nhật kết quả trận đấu
 */
router.put("/:matchId", (req, res) => {
    const { matchId } = req.params;
    const { home_score, away_score, status } = req.body;

    // Validate required fields
    if (home_score === undefined || away_score === undefined || !status) {
        return res.status(400).json({
            message: "Vui lòng cung cấp đầy đủ thông tin tỷ số và trạng thái",
        });
    }

    // Validate scores are non-negative numbers
    if (home_score < 0 || away_score < 0) {
        return res.status(400).json({
            message: "Tỷ số không thể là số âm",
        });
    }

    // Validate status
    const validStatuses = ["scheduled", "live", "finished"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message: "Trạng thái trận đấu không hợp lệ",
        });
    }

    // Lấy thông tin trận đấu hiện tại để kiểm tra trạng thái trước khi cập nhật
    const getMatchQuery = `SELECT status FROM matches WHERE id = ?`;
    db.query(getMatchQuery, [matchId], (err, matchResults) => {
        if (err) {
            console.error("Lỗi khi lấy thông tin trận đấu:", err);
            return res.status(500).json({
                message: "Không thể lấy thông tin trận đấu",
            });
        }

        if (matchResults.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy trận đấu",
            });
        }

        const oldStatus = matchResults[0].status;
        const statusChanged = oldStatus !== status;

        // Cập nhật trận đấu
        const updateQuery = `
            UPDATE matches 
            SET home_score = ?, away_score = ?, status = ?
            WHERE id = ?
        `;

        db.query(
            updateQuery,
            [home_score, away_score, status, matchId],
            (err, result) => {
                if (err) {
                    console.error("Lỗi cập nhật kết quả trận đấu:", err);
                    return res.status(500).json({
                        message: "Không thể cập nhật kết quả trận đấu",
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "Không tìm thấy trận đấu",
                    });
                }

                // Gửi thông báo nếu trạng thái trận đấu thay đổi
                if (statusChanged) {
                    // Import các hàm gửi thông báo
                    const { 
                        sendMatchStartNotification, 
                        sendMatchEndNotification 
                    } = require('../utils/matchNotifier');

                    // Nếu trạng thái mới là "live" (đang diễn ra), gửi thông báo bắt đầu
                    if (status === 'live' && oldStatus === 'scheduled') {
                        console.log(`Gửi thông báo bắt đầu cho trận đấu ${matchId}`);
                        sendMatchStartNotification(matchId);
                    }
                    // Nếu trạng thái mới là "finished" (kết thúc), gửi thông báo kết thúc
                    else if (status === 'finished' && (oldStatus === 'live' || oldStatus === 'scheduled')) {
                        console.log(`Gửi thông báo kết thúc cho trận đấu ${matchId}`);
                        sendMatchEndNotification(matchId);
                    }
                }

                res.json({
                    message: "Cập nhật kết quả trận đấu thành công",
                    notification_sent: statusChanged
                });
            }
        );
    });
});

/**
 * API đăng ký theo dõi trận đấu
 * Lưu thông tin đăng ký theo dõi của người dùng với trận đấu cụ thể
 */
router.post("/:matchId/subscribe", authMiddleware, (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;

  // Kiểm tra xem trận đấu có tồn tại không
  const matchCheckQuery = `SELECT id, status FROM matches WHERE id = ?`;
  db.query(matchCheckQuery, [matchId], (err, matchResults) => {
    if (err) {
      console.error("Lỗi kiểm tra trận đấu:", err);
      return res.status(500).json({
        error: "Lỗi khi kiểm tra trận đấu",
      });
    }

    if (matchResults.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy trận đấu",
      });
    }

    // Chỉ cho phép đăng ký với trận đấu chưa diễn ra
    if (matchResults[0].status !== 'scheduled') {
      return res.status(400).json({
        message: "Chỉ có thể đăng ký theo dõi trận đấu chưa diễn ra",
      });
    }

    // Kiểm tra xem người dùng đã đăng ký theo dõi trận đấu này chưa
    const checkSubscriptionQuery = `
      SELECT * FROM user_subscriptions 
      WHERE user_id = ? AND subscription_type = 'MATCH' AND entity_id = ?
    `;
    
    db.query(checkSubscriptionQuery, [userId, matchId], (err, subscriptionResults) => {
      if (err) {
        console.error("Lỗi kiểm tra đăng ký:", err);
        return res.status(500).json({
          error: "Lỗi khi kiểm tra đăng ký",
        });
      }

      if (subscriptionResults.length > 0) {
        return res.status(400).json({
          message: "Bạn đã đăng ký theo dõi trận đấu này",
        });
      }

      // Thêm đăng ký mới
      const insertSubscriptionQuery = `
        INSERT INTO user_subscriptions (user_id, subscription_type, entity_id)
        VALUES (?, 'MATCH', ?)
      `;
      
      db.query(insertSubscriptionQuery, [userId, matchId], (err, insertResult) => {
        if (err) {
          console.error("Lỗi đăng ký theo dõi trận đấu:", err);
          return res.status(500).json({
            error: "Lỗi khi đăng ký theo dõi trận đấu",
          });
        }

        return res.status(201).json({
          message: "Đăng ký theo dõi trận đấu thành công",
          subscription_id: insertResult.insertId
        });
      });
    });
  });
});

/**
 * API hủy đăng ký theo dõi trận đấu
 * Xóa thông tin đăng ký theo dõi của người dùng với trận đấu cụ thể
 */
router.delete("/:matchId/subscribe", authMiddleware, (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;

  // Xóa đăng ký theo dõi
  const deleteSubscriptionQuery = `
    DELETE FROM user_subscriptions 
    WHERE user_id = ? AND subscription_type = 'MATCH' AND entity_id = ?
  `;
  
  db.query(deleteSubscriptionQuery, [userId, matchId], (err, deleteResult) => {
    if (err) {
      console.error("Lỗi hủy đăng ký theo dõi trận đấu:", err);
      return res.status(500).json({
        error: "Lỗi khi hủy đăng ký theo dõi trận đấu",
      });
    }

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy đăng ký theo dõi trận đấu",
      });
    }

    return res.json({
      message: "Hủy đăng ký theo dõi trận đấu thành công",
    });
  });
});

/**
 * API kiểm tra đăng ký theo dõi trận đấu
 * Kiểm tra xem người dùng đã đăng ký theo dõi trận đấu hay chưa
 */
router.get("/:matchId/subscribe/status", authMiddleware, (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;

  // Kiểm tra đăng ký theo dõi
  const checkSubscriptionQuery = `
    SELECT * FROM user_subscriptions 
    WHERE user_id = ? AND subscription_type = 'MATCH' AND entity_id = ?
  `;
  
  db.query(checkSubscriptionQuery, [userId, matchId], (err, subscriptionResults) => {
    if (err) {
      console.error("Lỗi kiểm tra đăng ký theo dõi:", err);
      return res.status(500).json({
        error: "Lỗi khi kiểm tra đăng ký theo dõi",
      });
    }

    const isSubscribed = subscriptionResults.length > 0;
    
    return res.json({
      is_subscribed: isSubscribed,
      subscription_id: isSubscribed ? subscriptionResults[0].id : null
    });
  });
});

/**
 * API gửi thông báo trận đấu thủ công (chỉ dành cho admin để test)
 */
router.post("/:matchId/notify", authMiddleware, (req, res) => {
  const { matchId } = req.params;
  const { type } = req.query; // type có thể là: reminder, start, end

  // Kiểm tra quyền admin (comment lại để test)
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ message: "Không có quyền truy cập" });
  // }

  // Import matchNotifier
  const { 
    sendMatchReminderNotification, 
    sendMatchStartNotification,
    sendMatchEndNotification
  } = require('../utils/matchNotifier');

  // Gửi thông báo theo loại
  try {
    if (type === 'reminder') {
      sendMatchReminderNotification(matchId);
      return res.json({ message: "Đã gửi thông báo nhắc nhở trận đấu" });
    } else if (type === 'start') {
      sendMatchStartNotification(matchId);
      return res.json({ message: "Đã gửi thông báo bắt đầu trận đấu" });
    } else if (type === 'end') {
      sendMatchEndNotification(matchId);
      return res.json({ message: "Đã gửi thông báo kết thúc trận đấu" });
    } else {
      return res.status(400).json({ message: "Loại thông báo không hợp lệ. Sử dụng 'reminder', 'start', hoặc 'end'" });
    }
  } catch (error) {
    console.error("Lỗi khi gửi thông báo:", error);
    return res.status(500).json({ message: "Lỗi khi gửi thông báo" });
  }
});

module.exports = router;
