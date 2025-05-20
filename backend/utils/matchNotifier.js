const db = require("../config/db");
const { sendNotificationToUsers } = require("./pushNotification");

/**
 * Gửi thông báo cho người dùng đã đăng ký theo dõi trận đấu
 * @param {number} matchId - ID của trận đấu
 * @param {string} notificationType - Loại thông báo (match_start, match_end, etc.)
 * @param {string} title - Tiêu đề thông báo
 * @param {string} message - Nội dung thông báo
 */
const sendMatchNotification = async (matchId, notificationType, title, message) => {
  try {
    // Lấy danh sách người dùng đã đăng ký theo dõi trận đấu
    const query = `
      SELECT us.user_id
      FROM user_subscriptions us
      JOIN notification_settings ns ON us.user_id = ns.user_id
      WHERE us.subscription_type = 'MATCH' 
      AND us.entity_id = ?
      AND ns.push_enabled = true
      AND ns.${notificationType} = true
    `;

    db.query(query, [matchId], async (err, results) => {
      if (err) {
        console.error("Lỗi khi lấy danh sách người dùng đăng ký:", err);
        return;
      }

      if (results.length === 0) {
        console.log(`Không có người dùng đăng ký nhận thông báo cho trận đấu ${matchId}`);
        return;
      }

      // Lấy thông tin trận đấu
      const matchQuery = `
        SELECT 
          m.id, m.home_team_id, m.away_team_id, m.match_date, m.venue, 
          m.home_score, m.away_score, m.status, m.competition_id,
          ht.name as home_team_name, ht.image_url as home_team_image,
          at.name as away_team_name, at.image_url as away_team_image,
          c.name as competition_name
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.id
        JOIN teams at ON m.away_team_id = at.id
        JOIN competitions c ON m.competition_id = c.id
        WHERE m.id = ?
      `;

      db.query(matchQuery, [matchId], async (err, matchResults) => {
        if (err) {
          console.error("Lỗi khi lấy thông tin trận đấu:", err);
          return;
        }

        if (matchResults.length === 0) {
          console.error(`Không tìm thấy thông tin trận đấu ${matchId}`);
          return;
        }

        const matchInfo = matchResults[0];
        const matchParam = {
            "id": matchInfo.id,
            "home_team_id": matchInfo.home_team_id,
            "away_team_id": matchInfo.away_team_id,
            "home_score": matchInfo.home_score,
            "away_score": matchInfo.away_score,
            "status": matchInfo.status,
            "competition_id": matchInfo.competition_id,
            "home_team_name": matchInfo.home_team_name,
            "away_team_name": matchInfo.away_team_name,
            "competition_name": matchInfo.competition_name,
            "match_date": matchInfo.match_date,
            "venue": matchInfo.venue,
            "home_team_image": matchInfo.home_team_image,
            "away_team_image": matchInfo.away_team_image,
        }
        console.log(matchParam);
        // Dữ liệu điều hướng để mở chi tiết trận đấu khi nhấn vào thông báo
        const navigationData = JSON.stringify({
          screen: 'MatchStats',
          params: { match: matchParam }
        });

        // Danh sách userIds để gửi thông báo
        const userIds = results.map(user => user.user_id);
        console.log(`Tìm thấy ${userIds.length} người dùng đã đăng ký nhận thông báo cho trận đấu ${matchId}`);

        // Lưu thông báo vào cơ sở dữ liệu cho từng người dùng
        const insertNotifications = userIds.map(userId => {
          return new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO notifications 
               (user_id, notification_type, title, message, related_entity_type, related_entity_id, is_read, created_at, navigation_data) 
               VALUES (?, ?, ?, ?, 'MATCH', ?, false, NOW(), ?)`,
              [userId, notificationType, title, message, matchId, navigationData],
              (err, result) => {
                if (err) {
                  console.error(`Lỗi khi lưu thông báo cho người dùng ${userId}:`, err);
                  reject(err);
                } else {
                  resolve(result);
                }
              }
            );
          });
        });

        try {
          await Promise.all(insertNotifications);
          console.log(`Đã lưu thông báo cho ${userIds.length} người dùng về trận đấu ${matchId}`);
          
          // Gửi push notification sử dụng hàm có sẵn với danh sách userIds
          try {
            const notificationResult = await sendNotificationToUsers(userIds, title, message, { matchId, type: 'match', screen: 'MatchStats' });
            console.log(`Đã gửi push notification cho trận đấu ${matchId}:`, notificationResult);
          } catch (pushError) {
            console.error("Lỗi khi gửi push notification:", pushError);
          }
        } catch (error) {
          console.error("Lỗi khi xử lý thông báo:", error);
        }
      });
    });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo trận đấu:", error);
  }
};

/**
 * Gửi thông báo nhắc nhở trận đấu sẽ diễn ra
 * @param {number} matchId - ID của trận đấu
 */
const sendMatchReminderNotification = async (matchId) => {
  try {
    // Lấy thông tin trận đấu
    const matchQuery = `
      SELECT 
        m.id, m.home_team_id, m.away_team_id, m.match_date, m.venue, 
        m.status, m.competition_id,
        ht.name as home_team_name,
        at.name as away_team_name,
        c.name as competition_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN competitions c ON m.competition_id = c.id
      WHERE m.id = ? AND m.status = 'scheduled'
    `;

    db.query(matchQuery, [matchId], async (err, matchResults) => {
      if (err) {
        console.error("Lỗi khi lấy thông tin trận đấu:", err);
        return;
      }

      if (matchResults.length === 0) {
        console.log(`Không tìm thấy trận đấu ${matchId} hoặc trận đã diễn ra`);
        return;
      }

      const matchInfo = matchResults[0];
      const matchDate = new Date(matchInfo.match_date);
      const formattedDate = `${matchDate.getDate()}/${matchDate.getMonth() + 1}/${matchDate.getFullYear()} ${matchDate.getHours()}:${matchDate.getMinutes().toString().padStart(2, '0')}`;
      
      const title = `Trận đấu sắp diễn ra: ${matchInfo.home_team_name} vs ${matchInfo.away_team_name}`;
      const message = `Trận đấu giữa ${matchInfo.home_team_name} và ${matchInfo.away_team_name} thuộc giải ${matchInfo.competition_name} sẽ diễn ra vào lúc ${formattedDate}`;

      await sendMatchNotification(matchId, 'fixture_reminders', title, message);
    });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo nhắc nhở trận đấu:", error);
  }
};

/**
 * Gửi thông báo khi trận đấu bắt đầu
 * @param {number} matchId - ID của trận đấu
 */
const sendMatchStartNotification = async (matchId) => {
  try {
    // Lấy thông tin trận đấu
    const matchQuery = `
      SELECT 
        m.id, m.home_team_id, m.away_team_id, m.match_date, m.venue, 
        m.status, m.competition_id,
        ht.name as home_team_name,
        at.name as away_team_name,
        c.name as competition_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN competitions c ON m.competition_id = c.id
      WHERE m.id = ? AND m.status = 'live'
    `;

    db.query(matchQuery, [matchId], async (err, matchResults) => {
      if (err) {
        console.error("Lỗi khi lấy thông tin trận đấu:", err);
        return;
      }

      if (matchResults.length === 0) {
        console.log(`Không tìm thấy trận đấu ${matchId} hoặc trận chưa diễn ra`);
        return;
      }

      const matchInfo = matchResults[0];
      
      const title = `Trận đấu đã bắt đầu: ${matchInfo.home_team_name} vs ${matchInfo.away_team_name}`;
      const message = `Trận đấu giữa ${matchInfo.home_team_name} và ${matchInfo.away_team_name} thuộc giải ${matchInfo.competition_name} đã bắt đầu. Hãy xem ngay!`;

      await sendMatchNotification(matchId, 'match_start', title, message);
    });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo bắt đầu trận đấu:", error);
  }
};

/**
 * Gửi thông báo khi trận đấu kết thúc
 * @param {number} matchId - ID của trận đấu
 */
const sendMatchEndNotification = async (matchId) => {
  try {
    // Lấy thông tin trận đấu
    const matchQuery = `
      SELECT 
        m.id, m.home_team_id, m.away_team_id, m.match_date, m.venue, 
        m.home_score, m.away_score, m.status, m.competition_id,
        ht.name as home_team_name,
        at.name as away_team_name,
        c.name as competition_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN competitions c ON m.competition_id = c.id
      WHERE m.id = ? AND m.status = 'finished'
    `;

    db.query(matchQuery, [matchId], async (err, matchResults) => {
      if (err) {
        console.error("Lỗi khi lấy thông tin trận đấu:", err);
        return;
      }

      if (matchResults.length === 0) {
        console.log(`Không tìm thấy trận đấu ${matchId} hoặc trận chưa kết thúc`);
        return;
      }

      const matchInfo = matchResults[0];
      
      const title = `Trận đấu đã kết thúc: ${matchInfo.home_team_name} vs ${matchInfo.away_team_name}`;
      const message = `Trận đấu giữa ${matchInfo.home_team_name} và ${matchInfo.away_team_name} đã kết thúc với tỷ số ${matchInfo.home_score} - ${matchInfo.away_score}`;

      await sendMatchNotification(matchId, 'match_end', title, message);
    });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo kết thúc trận đấu:", error);
  }
};

module.exports = {
  sendMatchNotification,
  sendMatchReminderNotification,
  sendMatchStartNotification,
  sendMatchEndNotification
}; 