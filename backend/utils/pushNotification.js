const axios = require('axios');
const db = require('../config/db');

/**
 * Send push notification to devices using Expo Push Notification Service
 * @param {string} token - Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification message
 * @param {Object} data - Additional data to send with notification (e.g. navigation info)
 * @returns {Promise} - Promise resolving to push notification response
 */
async function sendPushNotification(token, title, body, data = {}) {
  try {
    // Validate token format
    if (!token.startsWith('ExponentPushToken[') && !token.startsWith('ExpoPushToken[')) {
      console.error('Invalid Expo push token format:', token);
      return { error: 'Invalid token format' };
    }

    // Prepare the notification payload
    const message = {
      to: token,
      title,
      body,
      data: data || {}
    };

    // Send the notification via Expo's Push API
    const response = await axios.post(
      'https://exp.host/--/api/v2/push/send',
      message,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
}

/**
 * Get user tokens from database and send notifications
 * @param {number} userId - ID of the user to send notification to
 * @param {string} title - Notification title
 * @param {string} body - Notification message
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise} - Promise resolving to result of all push notifications
 */
function sendNotificationToUser(userId, title, body, data = {}) {
  return new Promise((resolve, reject) => {
    // Get all tokens for the user
    db.query(
      'SELECT token FROM push_tokens WHERE user_id = ?',
      [userId],
      async (err, results) => {
        if (err) {
          console.error('Error fetching user tokens:', err);
          return reject(err);
        }

        if (results.length === 0) {
          return resolve({ 
            success: false, 
            message: 'No push tokens found for user' 
          });
        }

        // Send notification to all user devices
        const tokens = results.map(result => result.token);
        const pushPromises = tokens.map(token => 
          sendPushNotification(token, title, body, data)
        );

        try {
          const pushResults = await Promise.all(pushPromises);
          resolve({
            success: true,
            results: pushResults,
            deviceCount: tokens.length
          });
        } catch (error) {
          console.error('Error in batch push notification:', error);
          reject(error);
        }
      }
    );
  });
}

/**
 * Send notifications to multiple users
 * @param {Array<number>} userIds - Array of user IDs to send notifications to
 * @param {string} title - Notification title
 * @param {string} body - Notification message
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise} - Promise resolving to result of batch operations
 */
async function sendNotificationToUsers(userIds, title, body, data = {}) {
  try {
    const promises = userIds.map(userId => 
      sendNotificationToUser(userId, title, body, data)
    );
    
    const results = await Promise.all(promises);
    
    // Count successful notifications
    const successCount = results.reduce((count, result) => 
      count + (result.success ? 1 : 0), 0
    );
    
    // Count total devices notified
    const deviceCount = results.reduce((count, result) => 
      count + (result.deviceCount || 0), 0
    );
    
    return {
      success: true,
      userCount: userIds.length,
      successfulUserCount: successCount,
      deviceCount: deviceCount
    };
  } catch (error) {
    console.error('Error in bulk notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendPushNotification,
  sendNotificationToUser,
  sendNotificationToUsers
}; 