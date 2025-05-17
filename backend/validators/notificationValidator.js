const { body } = require("express-validator");

const updateNotificationSettingsValidator = [
  body("match_start").isBoolean().optional(),
  body("match_end").isBoolean().optional(),
  body("goals").isBoolean().optional(),
  body("red_cards").isBoolean().optional(),
  body("penalties").isBoolean().optional(),
  body("lineups").isBoolean().optional(),
  body("team_news").isBoolean().optional(),
  body("player_injuries").isBoolean().optional(),
  body("transfer_news").isBoolean().optional(),
  body("fixture_reminders").isBoolean().optional(),
  body("competition_updates").isBoolean().optional(),
  body("player_stats").isBoolean().optional(),
  body("comment_replies").isBoolean().optional(),
  body("comment_likes").isBoolean().optional(),
  body("mentions").isBoolean().optional(),
  body("push_enabled").isBoolean().optional(),
  body("email_enabled").isBoolean().optional(),
  body("quiet_hours_start").matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  body("quiet_hours_end").matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
];

module.exports = { updateNotificationSettingsValidator }; 