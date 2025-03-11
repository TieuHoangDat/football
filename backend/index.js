require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const newsRoutes = require("./routes/news");
const commentRoutes = require("./routes/comments");
const teamRoutes = require("./routes/teams");

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình Express để phục vụ ảnh từ thư mục "public"
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use("/auth", authRoutes);
app.use("/news", newsRoutes);
app.use("/comments", commentRoutes);
app.use("/teams", teamRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server chạy trên cổng ${PORT}`));
