const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
const sportsListController = require("../../controllers/sports/list.controller");

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// 스포츠 목록
router.get(
  "/",
  [rateLimit.apiLimiter],
  sportsListController.getSportsListForUser
);

module.exports = router;
