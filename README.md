# 🏆 Football App

Ứng dụng quản lý và hiển thị thông tin bóng đá, sử dụng **Express.js** cho backend và **React Native Expo** cho frontend.

---

## 🚀 Hướng dẫn cài đặt và chạy ứng dụng

### 💪 Bước 1: Thiết lập cơ sở dữ liệu MySQL
1. **Tạo database MySQL** sau đó chạy lệnh SQL trong file [`Script.sql`](./Script.sql) để khởi tạo database và dữ liệu mẫu.
2. Tạo file `.env` trong thư mục `backend` và thêm thông tin kết nối database:
   ```env
   DB_HOST=localhost
   DB_USER=user
   DB_PASSWORD=password
   DB_NAME=football
   DB_PORT=3306
   ```

---

### 🔧 Bước 2: Chạy backend Express.js
1. Cài đặt Node.js (phiên bản khuyến nghị: **LTS**).
2. Điều hướng vào thư mục backend:
   ```sh
   cd backend
   ```
3. Cài đặt dependencies:
   ```sh
   npm install
   ```
4. Chạy server backend:
   ```sh
   npm run dev
   ```
   🚀 Server sẽ chạy ở `http://localhost:5001`.

---

### 📱 Bước 3: Chạy frontend React Native Expo
1. Điều hướng vào thư mục frontend:
   ```sh
   cd frontend
   ```
2. Cài đặt dependencies:
   ```sh
   npm install
   ```

#### 🖥️ **Chạy trên Web**
- Sử dụng lệnh:
  ```sh
  npx expo start --web
  ```
- Mở **DevTools** (`Inspect`) trên trình duyệt và chọn **hiển thị giao diện mobile**.

#### 📱 **Chạy trên Android**
- Sử dụng lệnh:
  ```sh
  npx expo start
  ```
- Cài đặt **Expo Go** trên điện thoại và quét mã QR để chạy ứng dụng.

---




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