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




