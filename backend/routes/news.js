const express = require("express");
const db = require("../config/db");

const router = express.Router();

// API lấy tất cả tin tức
router.get("/", (req, res) => {
  db.query("SELECT * FROM news ORDER BY create_at DESC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi lấy danh sách tin tức" });
    }
    res.json(results);
  });
});

// API tìm kiếm tin tức theo từ khóa (title hoặc content)
router.post("/search", (req, res) => {
  const { keyword } = req.body;
  
  // Nếu không có từ khóa, trả về tất cả tin tức
  if (!keyword || keyword.trim() === "") {
    return db.query("SELECT * FROM news ORDER BY create_at DESC", (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi khi lấy danh sách tin tức" });
      }
      res.json(results);
    });
  }

  const searchQuery = "SELECT * FROM news WHERE title LIKE ? OR content LIKE ? ORDER BY create_at DESC";
  db.query(searchQuery, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi tìm kiếm tin tức" });
    }
    res.json(results);
  });
});

module.exports = router;
