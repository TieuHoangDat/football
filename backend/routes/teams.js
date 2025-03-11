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

module.exports = router;
