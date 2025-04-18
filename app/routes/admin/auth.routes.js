const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
// const loginController = require("../../controllers/auth/login.controller");

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// 로그인
// router.post("/login", [rateLimit.apiLimiter], loginController.loginForAdmin);

module.exports = router;
