const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { registerValidator, loginValidator } = require("../validators/authValidator");
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

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Lỗi server" });

    if (results.length === 0) return res.status(401).json({ error: "Email không tồn tại" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ error: "Mật khẩu không chính xác" });

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "7d" });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// Đăng xuất (Client xóa token)
router.post("/logout", (req, res) => {
  res.json({ message: "Đã đăng xuất" });
});

// Trả về thông tin voucher mẫu
router.get("/voucher", (req, res) => {
  const voucherData = {
    data: {
      id: "08dc432f-ca15-4d26-8cac-2ab2d68783a6",
      title: "voucher giảm % món Linh test",
      promoCode: "PRO-5051",
      status: 1,
      campaignStartDate: "2024-03-14T00:00:00",
      campaignEndDate: "2025-05-01T23:59:59",
      description: "<p>test</p>",
      shortDescription: "<p>test&nbsp;</p>",
      condition: "<p>test</p>",
      url: null,
      publishedDate: "2025-04-25T09:51:43.947375",
      typeName: "Promotion",
      typeId: "1",
      category: 1,
      categoryName: "Promotion",
      clmVoucherTypeId: "6184e0fc-bc71-4067-8b6f-34452a335dc6",
      clmVoucherTypeName: "GGG_EVoucher",
      isDeleted: false,
      restaurants: [
        {
          id: "08daad3c-8271-40eb-8381-43efb85ed146",
          code: 13,
          name: "Kichi-Kichi Phạm Ngọc Thạch",
          address: "101-B1 Phạm Ngọc Thạch, Đống Đa, Hà Nội",
          telephone: "0584693537",
          brandId: "08da8ee7-6efc-49d1-82cc-e679c0060053",
          brandName: "Kichi-Kichi - Lẩu băng chuyền",
          regionName: "Ha Noi"
        },
        {
          id: "08db9e7c-e2a4-403d-8e53-30d7623553a0",
          code: 99004,
          name: "Ecommerce_HN",
          address: "229 Tây Sơn, Ngã Tư Sở, Đống Đa, Hà Nội",
          telephone: "0584693537",
          brandId: "08dabb1c-1c52-412f-8941-c12871809b2e",
          brandName: "eCommerce",
          regionName: "Ha Noi"
        }
      ],
      partners: []
    },
    success: true,
    errors: []
  };

  res.json(voucherData);
});

module.exports = router;
