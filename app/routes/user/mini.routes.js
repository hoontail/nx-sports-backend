const express = require("express");
const router = express.Router();
const { rateLimit, authJwt } = require("../../middleware");
const miniListController = require("../../controllers/mini/list.controller");
const miniBettingController = require("../../controllers/mini/betting.controller");
const miniDeleteController = require("../../controllers/mini/delete.controller");

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// 다음 라운드
router.get(
  "/next",
  [rateLimit.apiLimiter],
  miniListController.getNextRoundForUser
);

// 배팅내역
router.get(
  "/history",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  miniListController.getMiniBetHistoryForUser
);

// 설정
router.get(
  "/config",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  miniListController.getMiniConfigForUser
);

// 베팅
router.post(
  "/betting",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  miniBettingController.bettingForUser
);

// 베팅내역 삭제
router.delete(
  "/history/:key",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  miniDeleteController.deleteHistoryForUser
);

// 베팅내역 선택 삭제
router.post(
  "/history/delete",
  [rateLimit.apiLimiter, authJwt.userVerifyToken],
  miniDeleteController.deleteMultiHistoryForUser
);

module.exports = router;
