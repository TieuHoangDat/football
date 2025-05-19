const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const {
    registerValidator,
    loginValidator,
} = require("../validators/authValidator");
const { validationResult } = require("express-validator");

const router = express.Router();
const SECRET_KEY = "your_secret_key";

// Đăng ký tài khoản
router.post("/register", registerValidator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Lỗi khi đăng ký" });
            }
            res.json({ message: "Đăng ký thành công" });
        }
    );
});

// Đăng nhập
router.post("/login", loginValidator, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ error: "Lỗi server" });

            if (results.length === 0)
                return res.status(401).json({ error: "Email không tồn tại" });

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch)
                return res
                    .status(401)
                    .json({ error: "Mật khẩu không chính xác" });

            const token = jwt.sign({ id: user.id }, SECRET_KEY, {
                expiresIn: "7d",
            });

            res.json({
                token,
                user: { id: user.id, email: user.email, name: user.name },
            });
        }
    );
});

// Đăng xuất (Client xóa token)
router.post("/logout", (req, res) => {
    res.json({ message: "Đã đăng xuất" });
});


// Lấy thông tin người dùng
router.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Không có token xác thực" });
        }

        const decoded = jwt.verify(token, SECRET_KEY);

        db.query(
            "SELECT id, name, email, role FROM users WHERE id = ?",
            [decoded.id],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: "Lỗi server" });
                }
                if (results.length === 0) {
                    return res
                        .status(404)
                        .json({ error: "Không tìm thấy người dùng" });
                }
                res.json(results[0]);
            }
        );
    } catch (error) {
        res.status(401).json({ error: "Token không hợp lệ" });
    }
});

module.exports = router;
