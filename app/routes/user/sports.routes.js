const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
const sportsListController = require("../../controllers/sports/list.controller");
const sportsBettingController = require("../../controllers/sports/betting.controller");
const sportsDeleteController = require("../../controllers/sports/delete.controller");

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
  sportsListController.getSportsMatchListForUser
);

// 스포츠 배팅
router.post(
  "/betting",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  sportsBettingController.bettingSports
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

// 설정
router.get(
  "/config",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  sportsListController.getMySportsConfigForUser
);

// 결과 목록
router.get(
  "/result",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  sportsListController.getResultListForUser
);

// 베팅내역
router.get(
  "/history",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  sportsListController.getSportsBetHistoryForUser
);

// 베팅내역 삭제
router.delete(
  "/history/:key",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  sportsDeleteController.deleteSportsBetHistoryForUser
);

// 베팅내역 선택 삭제
router.post(
  "/history/delete",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  sportsDeleteController.deleteMultiSportsBetHistoryForUser
);

// 스포츠 배팅 취소
router.post(
  "/betting/cancel",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  sportsBettingController.cancelBetHistoryForUser
);

// 스포츠 배팅 취소 확인
router.post(
  "/betting/cancel/check",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  sportsBettingController.checkCancelBettingHistoryForUser
);

module.exports = router;
