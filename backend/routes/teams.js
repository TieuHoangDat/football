const express = require("express");
const db = require("../config/db");

const router = express.Router();

// API lấy tất cả teams
router.get("/", (req, res) => {
  db.query("SELECT * FROM teams ORDER BY created_at DESC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi lấy danh sách teams" });
    }
    res.json(results);
  });
});

// API tìm kiếm team theo tên
router.post("/search", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Vui lòng nhập tên đội bóng cần tìm" });
  }

  const searchQuery = "SELECT * FROM teams WHERE name LIKE ?";
  db.query(searchQuery, [`%${name}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi tìm kiếm team" });
    }
    res.json(results);
  });
});

// API lấy danh sách teams theo player_id
router.get("/player/:playerId", (req, res) => {
  const { playerId } = req.params;

  const query = `
    SELECT t.* FROM teams t
    JOIN team_players tp ON t.id = tp.team_id
    WHERE tp.player_id = ?
    ORDER BY tp.is_current DESC, t.created_at DESC
  `;

  db.query(query, [playerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi lấy danh sách teams của cầu thủ" });
    }
    res.json(results);
  });
});


/**
 * API kiểm tra số lượng người theo dõi đội bóng và trạng thái theo dõi của người dùng
 */
router.get("/follow/:team_id/:email", (req, res) => {
  const { team_id, email } = req.params;

  // Lấy user_id từ email
  db.query("SELECT id FROM users WHERE email = ?", [email], (err, userResult) => {
      if (err) {
          console.error("Lỗi khi lấy user_id:", err);
          return res.status(500).json({ message: "Lỗi máy chủ" });
      }

      if (userResult.length === 0) {
          return res.status(404).json({ message: "User không tồn tại." });
      }

      const user_id = userResult[0].id;

      // Kiểm tra số lượng người theo dõi đội bóng
      db.query("SELECT COUNT(*) as follow_count FROM user_favorites_teams WHERE team_id = ?", [team_id], (err, countResult) => {
          if (err) {
              console.error("Lỗi khi đếm số lượt theo dõi:", err);
              return res.status(500).json({ message: "Lỗi máy chủ" });
          }

          const followCount = countResult[0].follow_count;

          // Kiểm tra xem người dùng có theo dõi đội này không
          db.query("SELECT id FROM user_favorites_teams WHERE user_id = ? AND team_id = ?", [user_id, team_id], (err, userFollow) => {
              if (err) {
                  console.error("Lỗi khi kiểm tra theo dõi:", err);
                  return res.status(500).json({ message: "Lỗi máy chủ" });
              }

              const isFollowing = userFollow.length > 0;
              res.json({ follow_count: followCount, is_following: isFollowing });
          });
      });
  });
});

/**
* API thêm/xóa theo dõi đội yêu thích
*/
router.post("/follow", (req, res) => {
  const { email, team_id } = req.body;

  console.log("Nhận request:", req.body);

  // Kiểm tra email có tồn tại
  db.query("SELECT id FROM users WHERE email = ?", [email], (err, userResult) => {
      if (err) {
          console.error("Lỗi khi lấy user_id:", err);
          return res.status(500).json({ message: "Lỗi máy chủ" });
      }

      if (userResult.length === 0) {
          console.log("User không tồn tại:", email);
          return res.status(404).json({ message: "User không tồn tại." });
      }

      const user_id = userResult[0].id;
      console.log("User ID:", user_id);

      // Kiểm tra người dùng đã theo dõi chưa
      db.query("SELECT id FROM user_favorites_teams WHERE user_id = ? AND team_id = ?", [user_id, team_id], (err, existingFollow) => {
          if (err) {
              console.error("Lỗi khi kiểm tra theo dõi:", err);
              return res.status(500).json({ message: "Lỗi máy chủ" });
          }

          if (existingFollow.length > 0) {
              console.log("User đã theo dõi, tiến hành hủy theo dõi.");

              // Hủy theo dõi
              db.query("DELETE FROM user_favorites_teams WHERE user_id = ? AND team_id = ?", [user_id, team_id], (err) => {
                  if (err) {
                      console.error("Lỗi khi hủy theo dõi:", err);
                      return res.status(500).json({ message: "Lỗi máy chủ" });
                  }
                  return res.json({ message: "Hủy theo dõi thành công", is_following: false });
              });
          } else {
              console.log("User chưa theo dõi, tiến hành thêm vào danh sách.");

              // Thêm vào danh sách theo dõi
              db.query("INSERT INTO user_favorites_teams (user_id, team_id) VALUES (?, ?)", [user_id, team_id], (err) => {
                  if (err) {
                      console.error("Lỗi khi thêm theo dõi:", err);
                      return res.status(500).json({ message: "Lỗi máy chủ" });
                  }
                  return res.json({ message: "Theo dõi thành công", is_following: true });
              });
          }
      });
  });
});
module.exports = router;
