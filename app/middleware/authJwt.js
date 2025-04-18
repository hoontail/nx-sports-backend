const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

userVerifyToken = async (req, res, next) => {
  const token = req.headers["access-token"];

  if (!token) {
    return res.status(401).send({
      message: "Token Is Not Valid",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "토큰이 만료되었습니다",
      });
    }

    const findUser = await User.findOne({
      where: {
        id: decoded.id,
      },
    });

    if (!findUser) {
      return res.status(401).send({
        message: "잘못된 요청입니다",
      });
    }

    req.user_id = decoded.id;

    next();
  });
};

adminVerifyToken = async (req, res, next) => {
  const token = req.headers["access-token"];

  if (!token) {
    return res.status(401).send({
      message: "Token Is Not Valid",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "토큰이 만료되었습니다",
      });
    }

    req.user_id = decoded.user_id;

    next();
  });
};

const authJwt = {
  userVerifyToken,
  adminVerifyToken,
};

module.exports = authJwt;
