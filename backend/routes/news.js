const express = require("express");
const db = require("../config/db");

const router = express.Router();

// API lấy tất cả tin tức
router.get("/", (req, res) => {
  const sql = `
    SELECT news.*, 
           (SELECT COUNT(*) FROM comments WHERE comments.news_id = news.id) AS comment_count
    FROM news
    ORDER BY create_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi lấy danh sách tin tức" });
    }
    res.json(results);
  });
});

// API lấy chi tiết bài viết theo ID
router.get("/:id", (req, res) => {
  const newsId = req.params.id;
  
  const sql = `
    SELECT news.*, 
           (SELECT COUNT(*) FROM comments WHERE comments.news_id = news.id) AS comment_count
    FROM news
    WHERE news.id = ?
  `;

  db.query(sql, [newsId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi lấy thông tin bài viết" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy bài viết" });
    }
    
    res.json(results[0]);
  });
});

// API tìm kiếm tin tức theo từ khóa (title hoặc content)
router.post("/search", (req, res) => {
  const { keyword } = req.body;
  
  let sql = `
    SELECT news.*, 
           (SELECT COUNT(*) FROM comments WHERE comments.news_id = news.id) AS comment_count
    FROM news
  `;

  let params = [];

  if (keyword && keyword.trim() !== "") {
    sql += " WHERE title LIKE ? OR content LIKE ? ";
    params = [`%${keyword}%`, `%${keyword}%`];
  }

  sql += " ORDER BY create_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi tìm kiếm tin tức" });
    }
    res.json(results);
  });
});

module.exports = router;
