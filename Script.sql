CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

INSERT INTO users (name, email, password) VALUES
('Nguyễn Văn A', 'nguyenvana@example.com', '$2b$10$x2NwMshx3uLJhFjh/wy22u1C9MRheGhE15T/D3NHt5VqupU44GQlG'), -- Mật khẩu: 123
('Trần Thị B', 'tranthib@example.com', '$2b$10$x2NwMshx3uLJhFjh/wy22u1C9MRheGhE15T/D3NHt5VqupU44GQlG'),
('Lê Văn C', 'levanc@example.com', '$2b$10$x2NwMshx3uLJhFjh/wy22u1C9MRheGhE15T/D3NHt5VqupU44GQlG'),
('Phạm Thị D', 'phamthid@example.com', '$2b$10$x2NwMshx3uLJhFjh/wy22u1C9MRheGhE15T/D3NHt5VqupU44GQlG');


CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(255), 
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO news (title, content, image) VALUES
('Messi giành Quả bóng vàng 2025', 'Lionel Messi chính thức giành Quả bóng vàng lần thứ 9 sau một mùa giải xuất sắc.', 'download.jpeg'),
('Real Madrid vô địch Champions League', 'Real Madrid đánh bại Man City trong trận chung kết để lên ngôi vô địch châu Âu.', 'download.jpeg'),
('Ronaldo lập kỷ lục mới ở Saudi League', 'Cristiano Ronaldo trở thành cầu thủ ghi nhiều bàn thắng nhất trong một mùa giải Saudi League.', 'download.jpeg'),
('Barcelona chiêu mộ ngôi sao trẻ', 'Barcelona vừa ký hợp đồng với tài năng trẻ người Brazil, dự kiến sẽ là trụ cột tương lai.', 'download.jpeg'),
('Premier League hấp dẫn hơn bao giờ hết', 'Cuộc đua vô địch Ngoại hạng Anh đang cực kỳ gay cấn với sự cạnh tranh của 4 đội hàng đầu.', 'download.jpeg');


CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    news_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);


-- Thêm bình luận gốc trước
INSERT INTO comments (news_id, user_id, parent_id, content) VALUES
(1, 1, NULL, 'Messi quá xứng đáng với danh hiệu này!'),
(2, 4, NULL, 'Real Madrid lại vô địch rồi! Hala Madrid!'),
(3, 2, NULL, 'Ronaldo thực sự là một huyền thoại sống.');



-- Giả sử ID của 3 bình luận gốc là 1, 2, 3, giờ mới chèn bình luận con
INSERT INTO comments (news_id, user_id, parent_id, content) VALUES
(1, 2, 1, 'Đúng rồi bạn, mùa giải này anh ấy chơi quá hay!'),
(1, 4, 1, 'Mình thấy Haaland cũng xứng đáng nhưng Messi vẫn nhỉnh hơn.'),
(2, 2, 2, 'Man City cũng đã chơi rất tốt, tiếc cho họ.'),
(3, 1, 3, 'Chuẩn luôn, dù ở đâu anh ấy vẫn tỏa sáng!');



CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    country VARCHAR(100),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO teams (name, description, country, image_url) VALUES
('Manchester United', 'Câu lạc bộ bóng đá nổi tiếng tại Anh.', 'Anh', 'Manchester City.png'),
('Real Madrid', 'Câu lạc bộ thành công nhất châu Âu.', 'Tây Ban Nha', 'Manchester City.png'),
('Paris Saint-Germain', 'Đội bóng mạnh nhất nước Pháp.', 'Pháp', 'Manchester City.png'),
('Bayern Munich', 'Gã khổng lồ nước Đức.', 'Đức', 'Manchester City.png'),
('AC Milan', 'Câu lạc bộ giàu truyền thống tại Ý.', 'Ý', 'Manchester City.png');

INSERT INTO teams (name, description, country, image_url) VALUES
('Barcelona', 'Đội bóng có lối chơi tiki-taka huyền thoại.', 'Tây Ban Nha', 'Barcelona.png'),
('Liverpool', 'Đội bóng giàu truyền thống tại Anh.', 'Anh', 'Liverpool.png'),
('Chelsea', 'Gã nhà giàu của bóng đá Anh.', 'Anh', 'Chelsea.png'),
('Juventus', 'Đội bóng hàng đầu của Ý.', 'Ý', 'Juventus.png'),
('Inter Milan', 'Một trong những đội bóng vĩ đại của Ý.', 'Ý', 'Inter Milan.png'),
('Arsenal', 'Pháo thủ thành London.', 'Anh', 'Arsenal.png'),
('Manchester City', 'Nhà vô địch nước Anh nhiều năm gần đây.', 'Anh', 'Manchester City.png'),
('Borussia Dortmund', 'Đội bóng mạnh của Bundesliga.', 'Đức', 'Borussia Dortmund.png'),
('Atletico Madrid', 'Đối thủ khó chịu của Real và Barca.', 'Tây Ban Nha', 'Atletico Madrid.png'),
('Tottenham Hotspur', 'Đội bóng mạnh của Premier League.', 'Anh', 'Tottenham Hotspur.png'),
('Napoli', 'Đội bóng từng được Maradona dẫn dắt.', 'Ý', 'Napoli.png'),
('AS Roma', 'Đội bóng thủ đô nước Ý.', 'Ý', 'AS Roma.png'),
('Sevilla', 'Đội bóng giàu thành tích tại Europa League.', 'Tây Ban Nha', 'Sevilla.png'),
('Ajax', 'Cái nôi đào tạo bóng đá Hà Lan.', 'Hà Lan', 'Ajax.png'),
('Porto', 'Đội bóng hàng đầu Bồ Đào Nha.', 'Bồ Đào Nha', 'Porto.png');


CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    position VARCHAR(50),
    birth_date DATE,
    nationality VARCHAR(100),
    height DECIMAL(4,2),
    weight DECIMAL(5,2),
    shirt_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_players (
    team_id INT,
    player_id INT,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, player_id)
);

ALTER TABLE team_players ADD COLUMN is_current TINYINT(1) DEFAULT 0;


INSERT INTO players (first_name, last_name, image_url, position, birth_date, nationality, height, weight, shirt_number) VALUES
('Cristiano', 'Ronaldo', 'ronaldo.png', 'Forward', '1985-02-05', 'Bồ Đào Nha', 1.87, 83.0, 7),
('Lionel', 'Messi', 'messi.png', 'Forward', '1987-06-24', 'Argentina', 1.70, 72.0, 10),
('Kylian', 'Mbappé', 'mbappe.png', 'Forward', '1998-12-20', 'Pháp', 1.78, 73.0, 7),
('Robert', 'Lewandowski', 'lewandowski.png', 'Forward', '1988-08-21', 'Ba Lan', 1.84, 80.0, 9),
('Kevin', 'De Bruyne', 'debruyne.png', 'Midfielder', '1991-06-28', 'Bỉ', 1.81, 70.0, 17);


INSERT INTO team_players (team_id, player_id) VALUES
(1, 1), -- Ronaldo -> Manchester United
(1, 2), -- Messi -> Real Madrid (Chỉ ví dụ, thực tế Messi chưa từng đá cho Real)
(3, 3), -- Mbappé -> PSG
(4, 4), -- Lewandowski -> Bayern Munich
(5, 5); -- De Bruyne -> AC Milan (Chỉ ví dụ, thực tế De Bruyne đá cho Man City)




CREATE TABLE comment_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    user_id INT NOT NULL,  -- Ai đã like/dislike bình luận
    comment_id INT NOT NULL,  -- Bình luận nào
    action ENUM('like', 'dislike') NOT NULL,  -- Like hoặc Dislike
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian like/dislike
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);


-- Bảng user_favorites_teams: Theo dõi đội yêu thích
CREATE TABLE user_favorites_teams (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID theo dõi
    user_id INT NOT NULL, -- ID người dùng
    team_id INT NOT NULL, -- ID đội bóng yêu thích
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Ngày đăng ký theo dõi
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);


-- Bảng user_favorite_players: Theo dõi cầu thủ yêu thích
CREATE TABLE user_favorite_players (
    id INT AUTO_INCREMENT PRIMARY KEY, -- ID theo dõi
    user_id INT NOT NULL, -- ID người dùng
    player_id INT NOT NULL, -- ID cầu thủ yêu thích
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Ngày đăng ký theo dõi
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Bảng competitions để lưu thông tin các giải đấu
create table competitions
(
    id         int auto_increment
        primary key,
    name       varchar(255)                            not null,
    country    varchar(100)                            null,
    logo_url   varchar(255)                            null,
    type       enum ('league', 'cup', 'international') not null,
    season     varchar(20)                             not null,
    created_at timestamp default CURRENT_TIMESTAMP     null
);

INSERT INTO football.competitions (id, name, country, logo_url, type, season, created_at) VALUES (1, 'Premier League', 'Anh', 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4e7.png', 'league', '2024-2025', '2025-05-15 15:59:51');
INSERT INTO football.competitions (id, name, country, logo_url, type, season, created_at) VALUES (2, 'La Liga', 'Tây Ban Nha', 'https://assets.laliga.com/assets/logos/laliga-v/laliga-v-1200x1200.png', 'league', '2024-2025', '2025-05-15 15:59:51');
INSERT INTO football.competitions (id, name, country, logo_url, type, season, created_at) VALUES (3, 'Champions League', null, 'https://assets.stickpng.com/images/5842fe06a6515b1e0ad75b3c.png', 'international', '2024-2025', '2025-05-15 15:59:51');
INSERT INTO football.competitions (id, name, country, logo_url, type, season, created_at) VALUES (4, 'Copa del Rey', 'Tây Ban Nha', 'https://upload.wikimedia.org/wikipedia/en/a/a9/Copa_del_Rey_logo.png', 'cup', '2024-2025', '2025-05-15 15:59:51');
INSERT INTO football.competitions (id, name, country, logo_url, type, season, created_at) VALUES (5, 'Serie A', 'Ý', 'https://upload.wikimedia.org/wikipedia/en/e/e1/Serie_A_logo_%282019%29.svg', 'league', '2024-2025', '2025-05-15 15:59:51');
INSERT INTO football.competitions (id, name, country, logo_url, type, season, created_at) VALUES (6, 'Bundesliga', 'Đức', 'https://assets.bundesliga.com/tachyon/sites/2/2019/08/bundesliga-logo-1024x1024.png', 'league', '2024-2025', '2025-05-15 15:59:51');
INSERT INTO football.competitions (id, name, country, logo_url, type, season, created_at) VALUES (7, 'Ligue 1', 'Pháp', 'https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Ligue_1_Uber_Eats.svg/1200px-Ligue_1_Uber_Eats.svg.png', 'league', '2024-2025', '2025-05-15 15:59:51');
INSERT INTO football.competitions (id, name, country, logo_url, type, season, created_at) VALUES (8, 'FA Cup', 'Anh', 'https://assets.stickpng.com/images/580b57fcd9996e24bc43c4ec.png', 'cup', '2024-2025', '2025-05-15 15:59:51');


-- Bảng matches để lưu thông tin các trận đấu
create table matches
(
    id             int auto_increment
        primary key,
    home_team_id   int                                                              not null,
    away_team_id   int                                                              not null,
    competition_id int                                                              not null,
    match_date     datetime                                                         not null,
    venue          varchar(255)                                                     null,
    home_score     int                                    default 0                 null,
    away_score     int                                    default 0                 null,
    status         enum ('scheduled', 'live', 'finished') default 'scheduled'       null,
    created_at     timestamp                              default CURRENT_TIMESTAMP null,
    constraint matches_ibfk_1
        foreign key (home_team_id) references teams (id)
            on delete cascade,
    constraint matches_ibfk_2
        foreign key (away_team_id) references teams (id)
            on delete cascade,
    constraint matches_ibfk_3
        foreign key (competition_id) references competitions (id)
            on delete cascade
);

create index away_team_id
    on matches (away_team_id);

create index competition_id
    on matches (competition_id);

create index home_team_id
    on matches (home_team_id);

INSERT INTO football.matches (id, home_team_id, away_team_id, competition_id, match_date, venue, home_score, away_score, status, created_at) VALUES (1, 1, 2, 1, '2025-03-15 20:00:00', 'Old Trafford', 2, 1, 'finished', '2025-05-15 15:59:51');
INSERT INTO football.matches (id, home_team_id, away_team_id, competition_id, match_date, venue, home_score, away_score, status, created_at) VALUES (2, 3, 4, 7, '2025-03-16 19:30:00', 'Parc des Princes', 3, 3, 'finished', '2025-05-15 15:59:51');
INSERT INTO football.matches (id, home_team_id, away_team_id, competition_id, match_date, venue, home_score, away_score, status, created_at) VALUES (3, 5, 6, 5, '2025-03-17 21:00:00', 'San Siro', 0, 2, 'finished', '2025-05-15 15:59:51');
INSERT INTO football.matches (id, home_team_id, away_team_id, competition_id, match_date, venue, home_score, away_score, status, created_at) VALUES (4, 7, 8, 1, '2025-03-20 20:45:00', 'Etihad Stadium', 4, 0, 'finished', '2025-05-15 15:59:51');
INSERT INTO football.matches (id, home_team_id, away_team_id, competition_id, match_date, venue, home_score, away_score, status, created_at) VALUES (5, 9, 10, 2, '2025-04-10 21:00:00', 'Wanda Metropolitano', 1, 1, 'finished', '2025-05-15 15:59:51');
INSERT INTO football.matches (id, home_team_id, away_team_id, competition_id, match_date, venue, home_score, away_score, status, created_at) VALUES (6, 12, 13, 4, '2025-04-15 19:00:00', 'Stadio Olimpico', null, null, 'scheduled', '2025-05-15 15:59:51');


-- Bảng match_stats để lưu thống kê của trận đấu
create table match_stats
(
    id              int auto_increment
        primary key,
    match_id        int                                 not null,
    team_id         int                                 not null,
    possession      decimal(5, 2)                       null,
    shots           int       default 0                 null,
    shots_on_target int       default 0                 null,
    corners         int       default 0                 null,
    fouls           int       default 0                 null,
    yellow_cards    int       default 0                 null,
    red_cards       int       default 0                 null,
    created_at      timestamp default CURRENT_TIMESTAMP null,
    constraint match_stats_ibfk_1
        foreign key (match_id) references matches (id)
            on delete cascade,
    constraint match_stats_ibfk_2
        foreign key (team_id) references teams (id)
            on delete cascade
);

create index match_id
    on match_stats (match_id);

create index team_id
    on match_stats (team_id);

INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (1, 1, 1, 45.30, 12, 5, 6, 10, 2, 0, '2025-05-15 15:59:51');
INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (2, 1, 2, 54.70, 15, 6, 8, 8, 3, 0, '2025-05-15 15:59:51');
INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (3, 2, 3, 51.20, 18, 8, 7, 12, 2, 0, '2025-05-15 15:59:51');
INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (4, 2, 4, 48.80, 14, 9, 5, 9, 1, 1, '2025-05-15 15:59:51');
INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (5, 3, 5, 38.50, 9, 3, 4, 15, 4, 1, '2025-05-15 15:59:51');
INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (6, 3, 6, 61.50, 17, 7, 9, 7, 1, 0, '2025-05-15 15:59:51');
INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (7, 4, 7, 67.80, 22, 12, 11, 6, 0, 0, '2025-05-15 15:59:51');
INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (8, 4, 8, 32.20, 5, 1, 2, 14, 3, 1, '2025-05-15 15:59:51');
INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (9, 5, 9, 48.90, 10, 4, 5, 18, 5, 0, '2025-05-15 15:59:51');
INSERT INTO football.match_stats (id, match_id, team_id, possession, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, created_at) VALUES (10, 5, 10, 51.10, 8, 2, 4, 11, 3, 0, '2025-05-15 15:59:51');


-- Bảng player_match_stats để lưu thống kê của cầu thủ trong trận đấu
create table player_match_stats
(
    id             int auto_increment
        primary key,
    match_id       int                                     not null,
    player_id      int                                     not null,
    team_id        int                                     not null,
    minutes_played int           default 0                 null,
    goals          int           default 0                 null,
    assists        int           default 0                 null,
    shots          int           default 0                 null,
    passes         int           default 0                 null,
    pass_accuracy  decimal(5, 2) default 0.00              null,
    tackles        int           default 0                 null,
    interceptions  int           default 0                 null,
    yellow_cards   int           default 0                 null,
    red_cards      int           default 0                 null,
    created_at     timestamp     default CURRENT_TIMESTAMP null,
    constraint player_match_stats_ibfk_1
        foreign key (match_id) references matches (id)
            on delete cascade,
    constraint player_match_stats_ibfk_2
        foreign key (player_id) references players (id)
            on delete cascade,
    constraint player_match_stats_ibfk_3
        foreign key (team_id) references teams (id)
            on delete cascade
);

create index match_id
    on player_match_stats (match_id);

create index player_id
    on player_match_stats (player_id);

create index team_id
    on player_match_stats (team_id);

INSERT INTO football.player_match_stats (id, match_id, player_id, team_id, minutes_played, goals, assists, shots, passes, pass_accuracy, tackles, interceptions, yellow_cards, red_cards, created_at) VALUES (1, 1, 1, 1, 90, 2, 0, 5, 42, 88.50, 1, 0, 0, 0, '2025-05-15 15:59:52');
INSERT INTO football.player_match_stats (id, match_id, player_id, team_id, minutes_played, goals, assists, shots, passes, pass_accuracy, tackles, interceptions, yellow_cards, red_cards, created_at) VALUES (2, 1, 2, 2, 90, 1, 1, 6, 65, 92.30, 0, 1, 0, 0, '2025-05-15 15:59:52');
INSERT INTO football.player_match_stats (id, match_id, player_id, team_id, minutes_played, goals, assists, shots, passes, pass_accuracy, tackles, interceptions, yellow_cards, red_cards, created_at) VALUES (3, 2, 3, 3, 90, 2, 1, 7, 38, 84.20, 2, 1, 1, 0, '2025-05-15 15:59:52');
INSERT INTO football.player_match_stats (id, match_id, player_id, team_id, minutes_played, goals, assists, shots, passes, pass_accuracy, tackles, interceptions, yellow_cards, red_cards, created_at) VALUES (4, 2, 4, 4, 85, 2, 0, 5, 27, 81.50, 0, 0, 0, 0, '2025-05-15 15:59:52');
INSERT INTO football.player_match_stats (id, match_id, player_id, team_id, minutes_played, goals, assists, shots, passes, pass_accuracy, tackles, interceptions, yellow_cards, red_cards, created_at) VALUES (5, 3, 5, 5, 75, 0, 0, 2, 56, 90.10, 3, 2, 1, 0, '2025-05-15 15:59:52');

-- Bảng notifications để lưu các thông báo của người dùng
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- MATCH_REMINDER, MATCH_START, MATCH_END, GOAL, RED_CARD, PENALTY, LINEUP_ANNOUNCED, TEAM_NEWS, PLAYER_INJURY, TRANSFER_NEWS, COMPETITION_START, SYSTEM_UPDATE, ACCOUNT, COMMENT_REPLY, COMMENT_LIKE, MENTION
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50), -- MATCH, TEAM, PLAYER, COMPETITION, SEASON, USER, SYSTEM, COMMENT
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng notification_settings để lưu cài đặt thông báo của người dùng
CREATE TABLE notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    match_start BOOLEAN DEFAULT TRUE,
    match_end BOOLEAN DEFAULT TRUE,
    goals BOOLEAN DEFAULT TRUE,
    red_cards BOOLEAN DEFAULT TRUE,
    penalties BOOLEAN DEFAULT TRUE,
    lineups BOOLEAN DEFAULT TRUE,
    team_news BOOLEAN DEFAULT TRUE,
    player_injuries BOOLEAN DEFAULT TRUE,
    transfer_news BOOLEAN DEFAULT TRUE,
    fixture_reminders BOOLEAN DEFAULT TRUE,
    competition_updates BOOLEAN DEFAULT TRUE,
    player_stats BOOLEAN DEFAULT FALSE,
    comment_replies BOOLEAN DEFAULT TRUE,
    comment_likes BOOLEAN DEFAULT TRUE,
    mentions BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng user_subscriptions để lưu đối tượng theo dõi của người dùng
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    subscription_type VARCHAR(50) NOT NULL, -- TEAM, PLAYER, COMPETITION
    entity_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, subscription_type, entity_id)
);

-- Tạo chỉ mục để tối ưu truy vấn
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_entity ON user_subscriptions(subscription_type, entity_id);

-- Tạo bảng push_tokens để lưu trữ token cho thông báo đẩy
CREATE TABLE IF NOT EXISTS push_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  device_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (user_id, token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
