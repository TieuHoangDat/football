const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const { sendNotificationToUser } = require("../utils/pushNotification");

const router = express.Router();

router.get("/:news_id", (req, res) => {
  const newsId = req.params.news_id;
  const sortBy = req.query.sortBy || "created_at"; // Mặc định sắp xếp theo thời gian

  // Xác định cột dùng để sắp xếp
  let orderBy = "c.created_at DESC"; // Mặc định theo thời gian mới nhất
  if (sortBy === "like_count") {
    orderBy = "like_count DESC, c.created_at DESC"; // Ưu tiên nhiều like, cùng lượt like thì theo thời gian
  }

  // Truy vấn lấy tất cả bình luận của bài viết, kèm số like/dislike
  const sql = `
    SELECT c.id, c.news_id, c.user_id, c.parent_id, c.content, c.created_at, 
           u.name AS user_name,
           COALESCE(like_data.like_count, 0) AS like_count,
           COALESCE(like_data.dislike_count, 0) AS dislike_count
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN (
        SELECT comment_id,
               SUM(CASE WHEN action = 'like' THEN 1 ELSE 0 END) AS like_count,
               SUM(CASE WHEN action = 'dislike' THEN 1 ELSE 0 END) AS dislike_count
        FROM comment_likes
        GROUP BY comment_id
    ) like_data ON c.id = like_data.comment_id
    WHERE c.news_id = ?
    ORDER BY ${orderBy}
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

      // Nếu là reply cho comment khác, gửi thông báo cho người viết comment gốc
      if (parent_id) {
        // Lấy thông tin của comment cha
        db.query(
          "SELECT user_id FROM comments WHERE id = ?",
          [parent_id],
          (err, parentCommentResults) => {
            if (!err && parentCommentResults.length > 0) {
              const parentCommentUserId = parentCommentResults[0].user_id;
              
              // Chỉ gửi thông báo nếu người trả lời khác với người viết comment gốc
              if (parentCommentUserId !== user_id) {
                // Lấy thông tin về bài viết
                db.query(
                  "SELECT title FROM news WHERE id = ?",
                  [news_id],
                  (err, newsResults) => {
                    if (!err && newsResults.length > 0) {
                      const newsTitle = newsResults[0].title;
                      
                      // Dữ liệu navigation JSON cho thông báo - sửa lại tham số truyền đúng
                      const navigationData = JSON.stringify({
                        screen: 'Comments',
                        params: {
                          id: news_id,  // CommentsScreen dùng id thay vì newsId
                          title: newsTitle,
                          commentId: result.insertId,  // Thêm commentId để cuộn đến
                          fromNotification: true  // Cờ cho biết đến từ thông báo
                        }
                      });
                      
                      // Tạo thông báo
                      db.query(
                        `INSERT INTO notifications 
                        (user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, navigation_data) 
                        VALUES (?, ?, ?, ?, ?, ?, false, ?)`,
                        [
                          parentCommentUserId,
                          'COMMENT_REPLY',
                          'Có người trả lời bình luận của bạn',
                          `Bình luận của bạn trong bài "${newsTitle}" vừa nhận được phản hồi mới`,
                          'COMMENT',
                          result.insertId,
                          navigationData
                        ],
                        (err, notificationResult) => {
                          if (err) {
                            console.error('Lỗi khi tạo thông báo:', err);
                          } else {
                            // Gửi push notification
                            sendNotificationToUser(
                              parentCommentUserId,
                              'Có người trả lời bình luận của bạn',
                              `Bình luận của bạn trong bài "${newsTitle}" vừa nhận được phản hồi mới`,
                              JSON.parse(navigationData)  // Convert string back to object for data payload
                            ).catch(pushErr => {
                              console.error('Lỗi khi gửi push notification cho reply:', pushErr);
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          }
        );
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
    const [user] = await db.promise().query("SELECT id, name FROM users WHERE email = ?", [email]);
    if (user.length === 0) return res.status(404).json({ error: "Người dùng không tồn tại" });

    const user_id = user[0].id;
    const user_name = user[0].name;

    // Kiểm tra xem user đã like hoặc dislike chưa
    const [existingRecord] = await db.promise().query(
      "SELECT * FROM comment_likes WHERE user_id = ? AND comment_id = ?", 
      [user_id, comment_id]
    );

    // Lấy thông tin về comment và người tạo comment
    const [commentData] = await db.promise().query(
      `SELECT c.id, c.user_id, c.content, c.news_id, n.title as news_title 
       FROM comments c
       JOIN news n ON c.news_id = n.id
       WHERE c.id = ?`, 
      [comment_id]
    );
    
    if (commentData.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy bình luận" });
    }
    
    const commentOwnerId = commentData[0].user_id;
    const newsId = commentData[0].news_id;
    const newsTitle = commentData[0].news_title;
    const commentContent = commentData[0].content.substring(0, 30) + (commentData[0].content.length > 30 ? "..." : "");
    
    let result;
    let shouldSendNotification = false;

    if (existingRecord.length > 0) {
      const existingAction = existingRecord[0].action;

      if (existingAction === action) {
        // Nếu user đã like và bấm like lần nữa -> Xóa like
        // Nếu user đã dislike và bấm dislike lần nữa -> Xóa dislike
        await db.promise().query(
          "DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?", 
          [user_id, comment_id]
        );
        result = { message: `${action} đã bị hủy`, action: null };
        shouldSendNotification = false;
      } else {
        // Nếu user đã like mà bấm dislike, hoặc ngược lại -> Cập nhật trạng thái
        await db.promise().query(
          "UPDATE comment_likes SET action = ? WHERE user_id = ? AND comment_id = ?", 
          [action, user_id, comment_id]
        );
        result = { message: `Đã chuyển sang ${action}`, action };
        shouldSendNotification = action === "like"; // Chỉ gửi thông báo nếu là like
      }
    } else {
      // Nếu user chưa like/dislike -> Thêm bản ghi mới
      await db.promise().query(
        "INSERT INTO comment_likes (user_id, comment_id, action) VALUES (?, ?, ?)", 
        [user_id, comment_id, action]
      );
      result = { message: `${action} thành công`, action };
      shouldSendNotification = action === "like"; // Chỉ gửi thông báo nếu là like
    }

    // Gửi thông báo nếu người like không phải là người viết comment
    if (shouldSendNotification && user_id !== commentOwnerId) {
      // Kiểm tra cài đặt thông báo của người dùng
      const [notificationSettings] = await db.promise().query(
        "SELECT comment_likes FROM notification_settings WHERE user_id = ?",
        [commentOwnerId]
      );
      
      // Nếu người dùng cho phép nhận thông báo khi có người like comment
      if (notificationSettings.length === 0 || notificationSettings[0].comment_likes) {
        // Dữ liệu navigation JSON cho thông báo - sửa lại tham số truyền đúng
        const navigationData = JSON.stringify({
          screen: 'Comments',
          params: {
            id: newsId,  // CommentsScreen dùng id thay vì newsId
            title: newsTitle,
            commentId: comment_id,  // Thêm commentId để cuộn đến
            fromNotification: true  // Cờ cho biết đến từ thông báo
          }
        });
        console.log(navigationData);
        // Tạo thông báo
        await db.promise().query(
          `INSERT INTO notifications 
           (user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, navigation_data) 
           VALUES (?, ?, ?, ?, ?, ?, false, ?)`,
          [
            commentOwnerId,
            'COMMENT_LIKE',
            'Có người thích bình luận của bạn',
            `${user_name} đã thích bình luận "${commentContent}" của bạn trong bài "${newsTitle}"`,
            'COMMENT',
            comment_id,
            navigationData
          ]
        );
        
        // Gửi push notification
        try {
          await sendNotificationToUser(
            commentOwnerId,
            'Có người thích bình luận của bạn',
            `${user_name} đã thích bình luận "${commentContent}" của bạn trong bài "${newsTitle}"`,
            JSON.parse(navigationData) // Convert string back to object for data payload
          );
        } catch (pushErr) {
          console.error('Lỗi khi gửi push notification cho like:', pushErr);
        }
      }
    }

    // Gửi thông báo dislike nếu người dislike không phải là người viết comment
    if (action === "dislike" && user_id !== commentOwnerId) {
      // Kiểm tra cài đặt thông báo của người dùng (sử dụng comment_likes setting vì chưa có riêng cho dislike)
      const [notificationSettings] = await db.promise().query(
        "SELECT comment_likes FROM notification_settings WHERE user_id = ?",
        [commentOwnerId]
      );
      
      // Nếu người dùng cho phép nhận thông báo 
      if (notificationSettings.length === 0 || notificationSettings[0].comment_likes) {
        // Dữ liệu navigation JSON cho thông báo
        const navigationData = JSON.stringify({
          screen: 'Comments',
          params: {
            id: newsId,
            title: newsTitle,
            commentId: comment_id,
            fromNotification: true
          }
        });
        
        // Tạo thông báo
        await db.promise().query(
          `INSERT INTO notifications 
           (user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, navigation_data) 
           VALUES (?, ?, ?, ?, ?, ?, false, ?)`,
          [
            commentOwnerId,
            'COMMENT_DISLIKE',
            'Có người không thích bình luận của bạn',
            `${user_name} đã không thích bình luận "${commentContent}" của bạn trong bài "${newsTitle}"`,
            'COMMENT',
            comment_id,
            navigationData
          ]
        );
        
        // Gửi push notification
        try {
          await sendNotificationToUser(
            commentOwnerId,
            'Có người không thích bình luận của bạn',
            `${user_name} đã không thích bình luận "${commentContent}" của bạn trong bài "${newsTitle}"`,
            JSON.parse(navigationData)
          );
        } catch (pushErr) {
          console.error('Lỗi khi gửi push notification cho dislike:', pushErr);
        }
      }
    }

    return res.json(result);
  } catch (error) {
    console.error("Lỗi xử lý like/dislike:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

/**
 * @route   GET /comments/detail/:comment_id
 * @desc    Lấy thông tin chi tiết về một comment
 * @access  Private
 */
router.get("/detail/:comment_id", authMiddleware, async (req, res) => {
  const commentId = req.params.comment_id;
  
  try {
    const [commentData] = await db.promise().query(
      `SELECT c.*, n.title as news_title 
       FROM comments c
       JOIN news n ON c.news_id = n.id
       WHERE c.id = ?`, 
      [commentId]
    );
    
    if (commentData.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy bình luận" });
    }
    
    return res.json(commentData[0]);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin comment:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
