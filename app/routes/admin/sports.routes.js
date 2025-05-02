const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
const sportsListController = require("../../controllers/sports/list.controller");
const sportsUpdateController = require("../../controllers/sports/update.controller");
const sportsDeleteController = require("../../controllers/sports/delete.controller");
const sportsCreateController = require("../../controllers/sports/create.controller");

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// 게임 설정
router.get(
  "/config",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsListController.getSportsConfigForAdmin
);

// 게임 설정 수정
router.patch(
  "/config",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsUpdateController.updateSportsConfigForAdmin
);

// 보너스 목록
router.get(
  "/bonus",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsListController.getBonusListForAdmin
);

// 보너스 상세
router.get(
  "/bonus/view",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsListController.getBonusViewForAdmin
);

// 보너스 등록
router.post(
  "/bonus",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsCreateController.createBonusForAdmin
);

// 보너스 수정
router.patch(
  "/bonus",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsUpdateController.updateBonusForAdmin
);

// 보너스 삭제
router.delete(
  "/bonus/:id",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsDeleteController.deleteBonusForAdmin
);

// 조합 목록
router.get(
  "/combine",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsListController.getCombineListForAdmin
);

// 조합 상세
router.get(
  "/combine/view",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsListController.getCombineViewForAdmin
);

// 조합 등록
router.post(
  "/combine",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsCreateController.createCombineForAdmin
);

// 조합 수정
router.patch(
  "/combine",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsUpdateController.updateCombineForAdmin
);

// 조합 삭제
router.delete(
  "/combine/:id",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsDeleteController.deleteCombineForAdmin
);

// 마켓 목록
router.get(
  "/market",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsListController.getMarketListForAdmin
);

// 마켓 상세
router.get(
  "/market/view",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsListController.getMarketViewForAdmin
);

// 마켓 수정
router.patch(
  "/market",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  sportsUpdateController.updateMarketForAdmin
);
module.exports = router;
