const { body } = require("express-validator");

const registerValidator = [
  body("name")
    .notEmpty().withMessage("Tên không được để trống")
    .isLength({ min: 3 }).withMessage("Tên phải có ít nhất 3 ký tự"),

  body("email")
    .isEmail().withMessage("Email không hợp lệ"),

  body("password")
    .isLength({ min: 3 }).withMessage("Mật khẩu phải có ít nhất 3 ký tự")
];

const loginValidator = [
  body("email")
    .isEmail().withMessage("Email không hợp lệ"),

  body("password")
    .notEmpty().withMessage("Mật khẩu không được để trống")
];

module.exports = { registerValidator, loginValidator };
