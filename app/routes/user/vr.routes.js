const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
const vrListController = require("../../controllers/vr/list.controller");
const vrBettingController = require("../../controllers/vr/betting.controller");
const vrDeleteController = require("../../controllers/vr/delete.controller");

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// 종목 목록
router.get(
  "/config/sports",
  [rateLimit.apiLimiter],
  vrListController.getVrSportsConfigListForUser
);

// 리그 목록
router.get(
  "/league",
  [rateLimit.apiLimiter],
  vrListController.getVrLeagueListForUser
);

// 설정
router.get(
  "/config",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  vrListController.getVrConfigForUser
);

// 보너스 목록
router.get(
  "/bonus",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  vrListController.getVrBonusListForUser
);

// 조합 목록
router.get(
  "/combine",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  vrListController.getVrCombineListForUser
);

// 경기 목록
router.get(
  "/odds",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  vrListController.getVrOddsListForUser
);

// 배팅
router.post(
  "/betting",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  vrBettingController.bettingVr
);

// 배팅 내역
router.get(
  "/history",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  vrListController.getVrBetHistoryForUser
);

// 베팅내역 삭제
router.delete(
  "/history/:key",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  vrDeleteController.deleteVrBetHistoryForUser
);

// 베팅내역 선택 삭제
router.post(
  "/history/delete",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  vrDeleteController.deleteMultiVrBetHistoryForUser
);

module.exports = router;
