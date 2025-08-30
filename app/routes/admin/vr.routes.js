const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
const vrListController = require("../../controllers/vr/list.controller");
const vrUpdateController = require("../../controllers/vr/update.controller");
const vrDeleteController = require("../../controllers/vr/delete.controller");
const vrCreateController = require("../../controllers/vr/create.controller");

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
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrSportsConfigListForAdmin
);

// 종목 상세
router.get(
  "/config/sports/view",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrSportsConfigViewForAdmin
);

// 종목 수정
router.patch(
  "/config/sports",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrUpdateController.updateVrSportsConfigForAdmin
);

// 설정 목록
router.get(
  "/config",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrConfigForAdmin
);

// 설정 수정
router.patch(
  "/config",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrUpdateController.updateVrConfigForAdmin
);

// 조합 목록
router.get(
  "/combine",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrCombineListForAdmin
);

// 조합 삭제
router.delete(
  "/combine/:id",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrDeleteController.deleteVrCombineForAdmin
);

// 조합 상세
router.get(
  "/combine/view",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrCombineViewForAdmin
);

// 조합 수정
router.patch(
  "/combine",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrUpdateController.updateVrCombineForAdmin
);

// 조합 등록
router.post(
  "/combine",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrCreateController.createVrCombineForAdmin
);

// 마켓 목록
router.get(
  "/market",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrMarketListForAdmin
);

// 마켓 수정
router.patch(
  "/market",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrUpdateController.updateVrMarketForAdmin
);

// 보너스 목록
router.get(
  "/bonus",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrBonusListForAdmin
);

// 보너스 상세
router.get(
  "/bonus/view",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrBonusViewForAdmin
);

// 보너스 수정
router.patch(
  "/bonus",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrUpdateController.updateVrBonusForAdmin
);

// 보너스 등록
router.post(
  "/bonus",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrCreateController.createBonusForAdmin
);

// 보너스 삭제
router.delete(
  "/bonus/:id",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrDeleteController.deleteBonusForAdmin
);

// 리그 목록
router.get(
  "/league",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrLeagueListForAdmin
);

// 리그 수정
router.patch(
  "/league",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrUpdateController.updateVrLeagueForAdmin
);

// 배팅 내역
router.get(
  "/history",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrBetHistoryForAdmin
);

// 배팅 상세
router.get(
  "/history/view",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrListController.getVrBetHistoryViewForAdmin
);

// 배팅 내역 수정
router.patch(
  "/history",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrUpdateController.updateVrBetHistoryForAdmin
);

// 배팅 상세 수정
router.patch(
  "/history/detail",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  vrUpdateController.updateVrBetDetailForAdmin
);

module.exports = router;
