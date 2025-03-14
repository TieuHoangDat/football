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


module.exports = router;
