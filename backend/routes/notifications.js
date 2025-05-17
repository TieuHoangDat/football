const express = require("express");
const db = require("../config/db");
const { validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const { updateNotificationSettingsValidator } = require("../validators/notificationValidator");

const router = express.Router();

/**
 * @route   GET /notifications/settings
 * @desc    Lấy cài đặt thông báo của người dùng
 * @access  Private
 */
router.get("/settings", authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM notification_settings WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Lỗi truy vấn:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }

      // Nếu chưa có cài đặt, tạo cài đặt mặc định
      if (results.length === 0) {
        db.query(
          "INSERT INTO notification_settings (user_id) VALUES (?)",
          [userId],
          (err, result) => {
            if (err) {
              console.error("Lỗi tạo cài đặt mặc định:", err);
              return res.status(500).json({ error: "Lỗi server khi tạo cài đặt mặc định" });
            }
            
            // Trả về cài đặt mặc định
            db.query(
              "SELECT * FROM notification_settings WHERE user_id = ?",
              [userId],
              (err, results) => {
                if (err) {
                  return res.status(500).json({ error: "Lỗi server" });
                }
                return res.json(results[0]);
              }
            );
          }
        );
      } else {
        // Trả về cài đặt hiện có
        return res.json(results[0]);
      }
    }
  );
});

/**
 * @route   PUT /notifications/settings
 * @desc    Cập nhật cài đặt thông báo của người dùng
 * @access  Private
 */
router.put("/settings", authMiddleware, updateNotificationSettingsValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const {
    match_start,
    match_end,
    goals,
    red_cards,
    penalties,
    lineups,
    team_news,
    player_injuries,
    transfer_news,
    fixture_reminders,
    competition_updates,
    player_stats,
    comment_replies,
    comment_likes,
    mentions,
    push_enabled,
    email_enabled,
    quiet_hours_start,
    quiet_hours_end
  } = req.body;

  // Kiểm tra xem user đã có cài đặt thông báo chưa
  db.query(
    "SELECT * FROM notification_settings WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi server" });
      }

      // Tạo một object chứa các trường cần cập nhật
      const fieldsToUpdate = {};
      
      // Chỉ thêm vào những field được gửi lên
      if (match_start !== undefined) fieldsToUpdate.match_start = match_start;
      if (match_end !== undefined) fieldsToUpdate.match_end = match_end;
      if (goals !== undefined) fieldsToUpdate.goals = goals;
      if (red_cards !== undefined) fieldsToUpdate.red_cards = red_cards;
      if (penalties !== undefined) fieldsToUpdate.penalties = penalties;
      if (lineups !== undefined) fieldsToUpdate.lineups = lineups;
      if (team_news !== undefined) fieldsToUpdate.team_news = team_news;
      if (player_injuries !== undefined) fieldsToUpdate.player_injuries = player_injuries;
      if (transfer_news !== undefined) fieldsToUpdate.transfer_news = transfer_news;
      if (fixture_reminders !== undefined) fieldsToUpdate.fixture_reminders = fixture_reminders;
      if (competition_updates !== undefined) fieldsToUpdate.competition_updates = competition_updates;
      if (player_stats !== undefined) fieldsToUpdate.player_stats = player_stats;
      if (comment_replies !== undefined) fieldsToUpdate.comment_replies = comment_replies;
      if (comment_likes !== undefined) fieldsToUpdate.comment_likes = comment_likes;
      if (mentions !== undefined) fieldsToUpdate.mentions = mentions;
      if (push_enabled !== undefined) fieldsToUpdate.push_enabled = push_enabled;
      if (email_enabled !== undefined) fieldsToUpdate.email_enabled = email_enabled;
      if (quiet_hours_start !== undefined) fieldsToUpdate.quiet_hours_start = quiet_hours_start;
      if (quiet_hours_end !== undefined) fieldsToUpdate.quiet_hours_end = quiet_hours_end;

      // Nếu không có gì để cập nhật
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ error: "Không có dữ liệu nào để cập nhật" });
      }

      if (results.length === 0) {
        // Nếu chưa có, tạo mới cài đặt
        fieldsToUpdate.user_id = userId; // Thêm user_id vào object
        
        const columns = Object.keys(fieldsToUpdate).join(", ");
        const valuePlaceholders = Object.keys(fieldsToUpdate).map(() => "?").join(", ");
        const values = Object.values(fieldsToUpdate);
        
        db.query(
          `INSERT INTO notification_settings (${columns}) VALUES (${valuePlaceholders})`,
          values,
          (err, result) => {
            if (err) {
              console.error("Lỗi khi tạo cài đặt:", err);
              return res.status(500).json({ error: "Lỗi server khi tạo cài đặt" });
            }
            
            return res.json({ 
              message: "Tạo cài đặt thông báo thành công",
              settings: fieldsToUpdate
            });
          }
        );
      } else {
        // Nếu đã có, cập nhật cài đặt hiện tại
        const setClause = Object.keys(fieldsToUpdate)
          .map(key => `${key} = ?`)
          .join(", ");
        const values = [...Object.values(fieldsToUpdate), userId];
        
        db.query(
          `UPDATE notification_settings SET ${setClause} WHERE user_id = ?`,
          values,
          (err, result) => {
            if (err) {
              console.error("Lỗi khi cập nhật cài đặt:", err);
              return res.status(500).json({ error: "Lỗi server khi cập nhật cài đặt" });
            }
            
            return res.json({ 
              message: "Cập nhật cài đặt thông báo thành công",
              settings: fieldsToUpdate
            });
          }
        );
      }
    }
  );
});

/**
 * @route   GET /notifications/subscriptions
 * @desc    Lấy danh sách đối tượng theo dõi của người dùng
 * @access  Private
 */
router.get("/subscriptions", authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM user_subscriptions WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Lỗi truy vấn:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }

      return res.json(results);
    }
  );
});

/**
 * @route   POST /notifications/subscriptions
 * @desc    Thêm đối tượng theo dõi mới
 * @access  Private
 */
router.post("/subscriptions", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { subscription_type, entity_id } = req.body;

  if (!subscription_type || !entity_id) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  // Kiểm tra xem subscription_type có hợp lệ không
  const validTypes = ["TEAM", "PLAYER", "COMPETITION"];
  if (!validTypes.includes(subscription_type.toUpperCase())) {
    return res.status(400).json({ error: "Loại đăng ký không hợp lệ" });
  }

  // Kiểm tra xem đã đăng ký chưa
  db.query(
    "SELECT * FROM user_subscriptions WHERE user_id = ? AND subscription_type = ? AND entity_id = ?",
    [userId, subscription_type.toUpperCase(), entity_id],
    (err, results) => {
      if (err) {
        console.error("Lỗi truy vấn:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "Bạn đã đăng ký theo dõi đối tượng này" });
      }

      // Thêm đăng ký mới
      db.query(
        "INSERT INTO user_subscriptions (user_id, subscription_type, entity_id) VALUES (?, ?, ?)",
        [userId, subscription_type.toUpperCase(), entity_id],
        (err, result) => {
          if (err) {
            console.error("Lỗi khi thêm đăng ký:", err);
            return res.status(500).json({ error: "Lỗi server khi thêm đăng ký" });
          }

          return res.status(201).json({ 
            message: "Đăng ký theo dõi thành công",
            subscription: {
              id: result.insertId,
              user_id: userId,
              subscription_type: subscription_type.toUpperCase(),
              entity_id
            }
          });
        }
      );
    }
  );
});

/**
 * @route   DELETE /notifications/subscriptions/:id
 * @desc    Hủy đăng ký theo dõi
 * @access  Private
 */
router.delete("/subscriptions/:id", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const subscriptionId = req.params.id;

  // Kiểm tra và xóa đăng ký
  db.query(
    "DELETE FROM user_subscriptions WHERE id = ? AND user_id = ?",
    [subscriptionId, userId],
    (err, result) => {
      if (err) {
        console.error("Lỗi khi xóa đăng ký:", err);
        return res.status(500).json({ error: "Lỗi server khi xóa đăng ký" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Không tìm thấy đăng ký hoặc bạn không có quyền xóa" });
      }

      return res.json({ message: "Hủy đăng ký thành công" });
    }
  );
});

/**
 * @route   GET /notifications
 * @desc    Lấy danh sách thông báo của người dùng
 * @access  Private
 */
router.get("/", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, is_read } = req.query;
  
  const offset = (page - 1) * limit;
  let query = "SELECT * FROM notifications WHERE user_id = ?";
  let queryParams = [userId];
  
  // Thêm điều kiện lọc theo trạng thái đã đọc nếu có
  if (is_read !== undefined) {
    query += " AND is_read = ?";
    queryParams.push(is_read === 'true' ? 1 : 0);
  }
  
  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  queryParams.push(parseInt(limit), offset);
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
    
    // Đếm tổng số thông báo
    let countQuery = "SELECT COUNT(*) as total FROM notifications WHERE user_id = ?";
    let countParams = [userId];
    
    if (is_read !== undefined) {
      countQuery += " AND is_read = ?";
      countParams.push(is_read === 'true' ? 1 : 0);
    }
    
    db.query(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error("Lỗi đếm thông báo:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }
      
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);
      
      return res.json({
        data: results,
        pagination: {
          total,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    });
  });
});

/**
 * @route   PUT /notifications/:id/read
 * @desc    Đánh dấu thông báo đã đọc
 * @access  Private
 */
router.put("/:id/read", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;
  
  db.query(
    "UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?",
    [notificationId, userId],
    (err, result) => {
      if (err) {
        console.error("Lỗi cập nhật thông báo:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Không tìm thấy thông báo hoặc bạn không có quyền cập nhật" });
      }
      
      return res.json({ message: "Đã đánh dấu thông báo là đã đọc" });
    }
  );
});

/**
 * @route   PUT /notifications/read/all
 * @desc    Đánh dấu tất cả thông báo đã đọc
 * @access  Private
 */
router.put("/read/all", authMiddleware, (req, res) => {
  const userId = req.user.id;
  
  db.query(
    "UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Lỗi cập nhật thông báo:", err);
        return res.status(500).json({ error: "Lỗi server" });
      }
      
      return res.json({ 
        message: "Đã đánh dấu tất cả thông báo là đã đọc",
        count: result.affectedRows
      });
    }
  );
});

/**
 * @route   POST /notifications/send
 * @desc    Gửi thông báo đến người dùng
 * @access  Private (Admin only)
 */
router.post("/send", authMiddleware, (req, res) => {
  const { user_id, notification_type, title, message, related_entity_type, related_entity_id, users } = req.body;
  
  // // Kiểm tra quyền admin (có thể thay đổi tùy theo cấu trúc của ứng dụng)
  // if (req.user.role !== 'admin') {
  //   return res.status(403).json({ error: "Không có quyền truy cập" });
  // }
  
  // Kiểm tra thông tin bắt buộc
  if ((!user_id && !users) || !notification_type || !title || !message) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }
  
  // Nếu có danh sách người dùng
  if (users && Array.isArray(users) && users.length > 0) {
    // Chuẩn bị các thông báo để chèn
    const notifications = users.map(userId => [
      userId,
      notification_type,
      title,
      message,
      related_entity_type || null,
      related_entity_id || null,
      false, // is_read
      new Date() // created_at
    ]);
    
    const query = `
      INSERT INTO notifications 
      (user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, created_at) 
      VALUES ?
    `;
    
    db.query(query, [notifications], (err, result) => {
      if (err) {
        console.error("Lỗi khi gửi thông báo:", err);
        return res.status(500).json({ error: "Lỗi server khi gửi thông báo" });
      }
      
      return res.status(201).json({
        message: `Đã gửi thông báo đến ${result.affectedRows} người dùng`,
        count: result.affectedRows
      });
    });
  } 
  // Nếu chỉ gửi cho một người dùng
  else {
    db.query(
      `INSERT INTO notifications 
       (user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, false, NOW())`,
      [user_id, notification_type, title, message, related_entity_type || null, related_entity_id || null],
      (err, result) => {
        if (err) {
          console.error("Lỗi khi gửi thông báo:", err);
          return res.status(500).json({ error: "Lỗi server khi gửi thông báo" });
        }
        
        return res.status(201).json({
          message: "Đã gửi thông báo thành công",
          notification_id: result.insertId
        });
      }
    );
  }
});

/**
 * @route   POST /notifications/broadcast
 * @desc    Gửi thông báo đến tất cả người dùng hoặc nhóm người dùng theo tiêu chí
 * @access  Private (Admin only)
 */
router.post("/broadcast", authMiddleware, (req, res) => {
  const { notification_type, title, message, related_entity_type, related_entity_id, target } = req.body;
  
  // Kiểm tra quyền admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Không có quyền truy cập" });
  }
  
  // Kiểm tra thông tin bắt buộc
  if (!notification_type || !title || !message) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }
  
  let userQuery = "SELECT id FROM users";
  let queryParams = [];
  
  // Lọc người dùng theo tiêu chí nếu có
  if (target) {
    // Các tiêu chí có thể là:
    // - subscription_type và entity_id: gửi cho người dùng đã đăng ký theo dõi đối tượng cụ thể
    if (target.subscription_type && target.entity_id) {
      userQuery = `
        SELECT user_id as id FROM user_subscriptions 
        WHERE subscription_type = ? AND entity_id = ?
      `;
      queryParams = [target.subscription_type, target.entity_id];
    }
    // Có thể thêm các tiêu chí khác tùy theo yêu cầu
  }
  
  // Lấy danh sách người dùng theo tiêu chí
  db.query(userQuery, queryParams, (err, users) => {
    if (err) {
      console.error("Lỗi khi lấy danh sách người dùng:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }
    
    if (users.length === 0) {
      return res.status(404).json({ 
        message: "Không tìm thấy người dùng phù hợp với tiêu chí" 
      });
    }
    
    // Chuẩn bị dữ liệu thông báo cho nhiều người dùng
    const notifications = users.map(user => [
      user.id,
      notification_type,
      title,
      message,
      related_entity_type || null,
      related_entity_id || null,
      false, // is_read
      new Date() // created_at
    ]);
    
    // Gửi thông báo cho tất cả người dùng
    const query = `
      INSERT INTO notifications 
      (user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, created_at) 
      VALUES ?
    `;
    
    db.query(query, [notifications], (err, result) => {
      if (err) {
        console.error("Lỗi khi gửi thông báo:", err);
        return res.status(500).json({ error: "Lỗi server khi gửi thông báo" });
      }
      
      return res.status(201).json({
        message: `Đã gửi thông báo đến ${result.affectedRows} người dùng`,
        count: result.affectedRows
      });
    });
  });
});

module.exports = router; 