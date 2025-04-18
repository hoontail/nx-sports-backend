const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
// const userViewController = require("../../controllers/user/view.controller");

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// 정보
// router.get(
//   "/info",
//   [rateLimit.apiLimiter, authJwt.userVerifyToken],
//   userViewController.getUserInfoForUser
// );

module.exports = router;
