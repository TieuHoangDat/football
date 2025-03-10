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

## Bước 2: Chạy backend express.js
- Cài đặt node
- Di chuyển vào backend: cd backend
- Tải thư viện dùng lệnh: npm install
- Chạy backend dùng lệnh: npm run dev

## Bước 3: Chạy frontend react native expo
### Để hiển thị trên web
- Di chuyển vào frontend: cd frontend
- npx expo start --web
- Vào inspect trong trình duyệt chọn hiển thị trên điện thoại

### Hiển thị trên android
- npx expo start
- Cài Expo Go và quét QR