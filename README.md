# football

# Cách bước chạy
## Bước 1 tạo database Mysql và kết nối với backend
- Tạo db Mysql và tạo bảng users với câu lệnh sql trong file Script.sql
- Tạo file .env trong thư mục backend
- Thêm các thông tin vào file .env, ví dụ:
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=football
DB_PORT=3306

- Chạy các lệnh trong Script.sql để tạo bảng và thêm dữ liệu

## Bước 2: Chạy backend express.js
- Cài đặt node, npm nếu chưa có
- Di chuyển vào backend: cd backend
- Tải thư viện dùng lệnh: npm install
- Chạy backend dùng lệnh: npm run dev

## Bước 3: Chạy frontend react native expo
- Di chuyển vào frontend: cd frontend
- Tải thư viện dùng lệnh: npm install

### Để hiển thị trên web
- npx expo start --web
- Vào inspect trong trình duyệt chọn hiển thị dưới dạng giao diện mobile

### Hiển thị trên android
- npx expo start
- Cài Expo Go và quét QR


# Các chức năng
## 1. Cập Nhật Kết Quả Nhanh Chóng:
·   Cung cấp thông tin chi tiết về kết quả các trận đấu và sự kiện thể thao từ khắp nơi trên thế giới.
·   Cập nhật nhanh chóng sau mỗi trận đấu để người hâm mộ không bỏ lỡ bất kỳ thông tin quan trọng nào.
## 2. Lịch Thi Đấu Chi Tiết:
·   Hiển thị lịch thi đấu đầy đủ của các giải đấu và sự kiện thể thao.
·   Thông tin về thời gian, địa điểm, và đội tham gia giúp người hâm mộ lên kế hoạch theo dõi.
## 3. Thông Tin Đội Yêu Thích:
·   Cung cấp thông tin chi tiết về các đội yêu thích của người dùng.
·   Thống kê về thành tích, đội hình, và các cầu thủ nổi bật.
## 4. Tin Tức và Bình Luận:
·   Tổng hợp tin tức mới nhất về thể thao từ các nguồn tin đáng tin cậy.
·   Cung cấp bình luận chân thực và phản ảnh từ chuyên gia và cộng đồng người hâm mộ.
## 5. Thông Báo Tùy Chọn:
·   Cho phép người dùng đăng ký nhận thông báo về kết quả, tin tức, và sự kiện quan trọng.
·   Thông báo tùy chỉnh theo sở thích cá nhân.
## 6. Thống Kê và Đánh Giá:
·   Hiển thị thống kê chi tiết về các mục như bàn thắng, đối đầu trực tiếp, và tỷ lệ chiến thắng.
·   Cung cấp tính năng đánh giá để người hâm mộ chia sẻ ý kiến cá nhân về trận đấu.
## 7. Giao Diện Thân Thiện Người Dùng:
·   Thiết kế giao diện dễ sử dụng, linh hoạt trên cả điện thoại di động và máy tính.
·   Tích hợp công nghệ tìm kiếm thông tin nhanh chóng và thuận tiện.