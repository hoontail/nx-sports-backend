const RateLimit = require("express-rate-limit");

// 너무 자주 호출못하도록 리밋
exports.apiLimiter = new RateLimit({
  windowMs: 60 * 1000, // 이 시간 동안
  max: 60000, // 최대 횟수
  delayMs: 0, // 요청 간 간격
  handler(req, res) {
    // 어겼을 경우 메시지
    res.status(this.statusCode).json({
      code: this.statusCode, // 기본 429
      message: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.",
    });
  },
});
