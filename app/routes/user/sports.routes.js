const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
const sportsListController = require("../../controllers/sports/list.controller");
const sportsBettingController = require("../../controllers/sports/betting.controller");

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

// 스포츠 배팅
router.post(
  "/betting",
  [rateLimit.apiLimiter],
  sportsBettingController.bettingSportsTest
);

// 보너스 목록
router.get(
  "/bonus",
  [rateLimit.apiLimiter],
  sportsListController.getBonusListForUser
);

// 조합 목록
router.get(
  "/combine",
  [rateLimit.apiLimiter],
  sportsListController.getCombineListForUser
);

module.exports = router;
