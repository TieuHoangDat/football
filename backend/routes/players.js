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

module.exports = router;
