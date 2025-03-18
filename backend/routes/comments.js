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

// API thêm bình luận bằng email
router.post("/", (req, res) => {
  const { news_id, email, parent_id, content } = req.body;

  if (!news_id || !email || !content) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  // Truy vấn lấy user_id từ email
  const getUserIdQuery = `SELECT id FROM users WHERE email = ?`;

  db.query(getUserIdQuery, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi truy vấn người dùng" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    const user_id = results[0].id;

    // Chèn bình luận vào database
    const insertCommentQuery = `
      INSERT INTO comments (news_id, user_id, parent_id, content)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertCommentQuery, [news_id, user_id, parent_id || null, content], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi khi thêm bình luận" });
      }

      res.status(201).json({ message: "Bình luận đã được thêm", comment_id: result.insertId });
    });
  });
});

router.get("/likes/:comment_id/:email", (req, res) => {
  const { comment_id, email } = req.params;

  // Tìm user_id từ email
  const getUserIdSql = "SELECT id FROM users WHERE email = ?";
  
  db.query(getUserIdSql, [email], (err, userResults) => {
    if (err) return res.status(500).json({ error: "Lỗi khi tìm user" });

    if (userResults.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại" });
    }

    const user_id = userResults[0].id;

    // Truy vấn số like/dislike và trạng thái của user
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = ? AND action = 'like') AS like_count,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = ? AND action = 'dislike') AS dislike_count,
        (SELECT action FROM comment_likes WHERE comment_id = ? AND user_id = ?) AS user_action
    `;

    db.query(sql, [comment_id, comment_id, comment_id, user_id], (err, results) => {
      if (err) return res.status(500).json({ error: "Lỗi khi lấy dữ liệu" });

      res.json({
        like_count: results[0].like_count,
        dislike_count: results[0].dislike_count,
        user_action: results[0].user_action || null, // null nếu user chưa like/dislike
      });
    });
  });
});

/**
 * API xử lý like hoặc dislike
 * @param {string} email - Email của người dùng
 * @param {number} comment_id - ID của comment
 * @param {string} action - "like" hoặc "dislike"
 */
router.post("/toggle", async (req, res) => {
  const { email, comment_id, action } = req.body;
  
  if (!email || !comment_id || !["like", "dislike"].includes(action)) {
    return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
  }

  try {
    // Lấy user_id từ email
    const [user] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);
    if (user.length === 0) return res.status(404).json({ error: "Người dùng không tồn tại" });

    const user_id = user[0].id;

    // Kiểm tra xem user đã like hoặc dislike chưa
    const [existingRecord] = await db.promise().query(
      "SELECT * FROM comment_likes WHERE user_id = ? AND comment_id = ?", 
      [user_id, comment_id]
    );

    if (existingRecord.length > 0) {
      const existingAction = existingRecord[0].action;

      if (existingAction === action) {
        // Nếu user đã like và bấm like lần nữa -> Xóa like
        // Nếu user đã dislike và bấm dislike lần nữa -> Xóa dislike
        await db.promise().query(
          "DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?", 
          [user_id, comment_id]
        );
        return res.json({ message: `${action} đã bị hủy`, action: null });
      } else {
        // Nếu user đã like mà bấm dislike, hoặc ngược lại -> Cập nhật trạng thái
        await db.promise().query(
          "UPDATE comment_likes SET action = ? WHERE user_id = ? AND comment_id = ?", 
          [action, user_id, comment_id]
        );
        return res.json({ message: `Đã chuyển sang ${action}`, action });
      }
    } else {
      // Nếu user chưa like/dislike -> Thêm bản ghi mới
      await db.promise().query(
        "INSERT INTO comment_likes (user_id, comment_id, action) VALUES (?, ?, ?)", 
        [user_id, comment_id, action]
      );
      return res.json({ message: `${action} thành công`, action });
    }
  } catch (error) {
    console.error("Lỗi xử lý like/dislike:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});


module.exports = router;
