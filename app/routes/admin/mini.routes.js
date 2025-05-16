const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
const miniListController = require("../../controllers/mini/list.controller");
const miniUpdateController = require("../../controllers/mini/update.controller");

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
  miniListController.getMiniConfigForAdmin
);

// 게임 설정 수정
router.patch(
  "/config",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  miniUpdateController.updateMiniConfigForAdmin
);

// 배팅타입 목록
router.get(
  "/bettype",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  miniListController.getMiniBetTypeListForAdmin
);

// 배팅타입 상세
router.get(
  "/bettype/view",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  miniListController.getMiniBetTypeViewForAdmin
);

// 배팅타입 수정
router.patch(
  "/bettype",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  miniUpdateController.updateMiniBetTypeForAdmin
);

// 배팅내역
router.get(
  "/history",
  [rateLimit.apiLimiter, authJwt.adminVerifyToken],
  miniListController.getMiniBetHistoryForAdmin
);

module.exports = router;
