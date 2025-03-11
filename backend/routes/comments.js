const express = require("express");
const db = require("../config/db");

const router = express.Router();

// API lấy tất cả bình luận của một bài viết theo dạng cây
router.get("/:news_id", (req, res) => {
  const newsId = req.params.news_id;

  // Truy vấn tất cả bình luận của bài viết
  const sql = `
    SELECT c.id, c.news_id, c.user_id, c.parent_id, c.content, c.created_at, u.name AS user_name
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.news_id = ?
    ORDER BY c.created_at ASC
  `;

  db.query(sql, [newsId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi lấy danh sách bình luận" });
    }

    // Chuyển danh sách bình luận thành dạng cây
    const buildCommentTree = (comments, parentId = null) => {
      return comments
        .filter(comment => comment.parent_id === parentId)
        .map(comment => ({
          ...comment,
          replies: buildCommentTree(comments, comment.id), // Đệ quy tạo danh sách bình luận con
        }));
    };

    const commentsTree = buildCommentTree(results);
    res.json(commentsTree);
  });
});

module.exports = router;
