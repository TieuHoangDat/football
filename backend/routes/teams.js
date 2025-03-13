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

module.exports = router;
