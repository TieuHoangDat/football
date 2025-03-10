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

module.exports = router;
