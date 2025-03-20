const express = require("express");
const db = require("../config/db");

const router = express.Router();

// API lấy tất cả cầu thủ
router.get("/", (req, res) => {
  db.query("SELECT * FROM players ORDER BY created_at DESC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi lấy danh sách cầu thủ" });
    }
    res.json(results);
  });
});

// API tìm kiếm cầu thủ theo tên hoặc họ
router.post("/search", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Vui lòng nhập tên cầu thủ cần tìm" });
  }

  const searchQuery = "SELECT * FROM players WHERE first_name LIKE ? OR last_name LIKE ?";
  db.query(searchQuery, [`%${name}%`, `%${name}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi tìm kiếm cầu thủ" });
    }
    res.json(results);
  });
});

// API lấy danh sách cầu thủ theo team_id
router.get("/team/:team_id", (req, res) => {
  const { team_id } = req.params;

  const query = `
    SELECT p.* 
    FROM players p
    JOIN team_players tp ON p.id = tp.player_id
    WHERE tp.team_id = ?
    ORDER BY p.created_at DESC
  `;

  db.query(query, [team_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi lấy danh sách cầu thủ theo đội bóng" });
    }
    res.json(results);
  });
});

/**
 * API kiểm tra số lượng người theo dõi cầu thủ và trạng thái theo dõi của người dùng
 */
router.get("/follow/:player_id/:email", (req, res) => {
  const { player_id, email } = req.params;

  // Lấy user_id từ email
  const getUserQuery = "SELECT id FROM users WHERE email = ?";
  db.query(getUserQuery, [email], (err, userResult) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi truy vấn dữ liệu người dùng" });
    }
    if (userResult.length === 0) {
      return res.status(404).json({ message: "User không tồn tại." });
    }

    const user_id = userResult[0].id;

    // Lấy số lượng theo dõi cầu thủ
    const countQuery = "SELECT COUNT(*) AS follow_count FROM user_favorite_players WHERE player_id = ?";
    db.query(countQuery, [player_id], (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi khi lấy số lượng theo dõi" });
      }
      const followCount = countResult[0].follow_count;

      // Kiểm tra trạng thái theo dõi của user
      const checkFollowQuery = "SELECT id FROM user_favorite_players WHERE user_id = ? AND player_id = ?";
      db.query(checkFollowQuery, [user_id, player_id], (err, followResult) => {
        if (err) {
          return res.status(500).json({ error: "Lỗi khi kiểm tra trạng thái theo dõi" });
        }
        const isFollowing = followResult.length > 0;
        res.json({ follow_count: followCount, is_following: isFollowing });
      });
    });
  });
});

/**
 * API thêm/xóa theo dõi cầu thủ yêu thích
 */
router.post("/follow", (req, res) => {
  const { email, player_id } = req.body;

  // Kiểm tra email có tồn tại không
  const getUserQuery = "SELECT id FROM users WHERE email = ?";
  db.query(getUserQuery, [email], (err, userResult) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi truy vấn dữ liệu người dùng" });
    }
    if (userResult.length === 0) {
      return res.status(404).json({ message: "User không tồn tại." });
    }

    const user_id = userResult[0].id;

    // Kiểm tra trạng thái theo dõi
    const checkFollowQuery = "SELECT id FROM user_favorite_players WHERE user_id = ? AND player_id = ?";
    db.query(checkFollowQuery, [user_id, player_id], (err, followResult) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi khi kiểm tra trạng thái theo dõi" });
      }

      if (followResult.length > 0) {
        // Nếu đã theo dõi, thực hiện hủy theo dõi
        const deleteQuery = "DELETE FROM user_favorite_players WHERE user_id = ? AND player_id = ?";
        db.query(deleteQuery, [user_id, player_id], (err) => {
          if (err) {
            return res.status(500).json({ error: "Lỗi khi hủy theo dõi" });
          }
          res.json({ message: "Hủy theo dõi thành công", is_following: false });
        });
      } else {
        // Nếu chưa theo dõi, thực hiện thêm theo dõi
        const insertQuery = "INSERT INTO user_favorite_players (user_id, player_id) VALUES (?, ?)";
        db.query(insertQuery, [user_id, player_id], (err) => {
          if (err) {
            return res.status(500).json({ error: "Lỗi khi thêm theo dõi" });
          }
          res.json({ message: "Theo dõi thành công", is_following: true });
        });
      }
    });
  });
});


module.exports = router;
