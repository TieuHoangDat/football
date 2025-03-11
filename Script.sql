CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);


CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(255), 
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO news (title, content, image) VALUES
('Messi giành Quả bóng vàng 2025', 'Lionel Messi chính thức giành Quả bóng vàng lần thứ 9 sau một mùa giải xuất sắc.', 'download.jpeg'),
('Real Madrid vô địch Champions League', 'Real Madrid đánh bại Man City trong trận chung kết để lên ngôi vô địch châu Âu.', ' download.jpeg'),
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


INSERT INTO comments (news_id, user_id, parent_id, content) VALUES
(1, 1, NULL, 'Messi quá xứng đáng với danh hiệu này!'),
(1, 2, 1, 'Đúng rồi bạn, mùa giải này anh ấy chơi quá hay!'),
(1, 3, 1, 'Mình thấy Haaland cũng xứng đáng nhưng Messi vẫn nhỉnh hơn.'),
(2, 4, NULL, 'Real Madrid lại vô địch rồi! Hala Madrid!'),
(2, 2, 4, 'Man City cũng đã chơi rất tốt, tiếc cho họ.'),
(3, 5, NULL, 'Ronaldo thực sự là một huyền thoại sống.'),
(3, 1, 6, 'Chuẩn luôn, dù ở đâu anh ấy vẫn tỏa sáng!');
