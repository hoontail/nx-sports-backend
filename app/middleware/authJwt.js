const db = require("../models");
const Op = db.Sequelize.Op;
const User = db.up_users;

const moment = require("moment");

userVerifyToken = async (req, res, next) => {
  const token = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).send({
      message: "Token Is Not Valid",
    });
  }

  try {
    const findUser = await User.findOne({
      where: {
        token,
        token_expired: {
          [Op.gt]: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        role_name: {
          [Op.notIn]: ["admin", "agent"],
        },
      },
    });

    if (!findUser) {
      return res.status(401).send({
        message: "Token Is Not Valid",
      });
    }

    req.user_id = findUser.id;
    req.username = findUser.username;
    next();
  } catch (err) {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

adminVerifyToken = async (req, res, next) => {
  const token = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).send({
      message: "Token Is Not Valid",
    });
  }

  try {
    const findUser = await User.findOne({
      where: {
        token,
        token_expired: {
          [Op.gt]: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        role_name: ["admin", "agent"],
      },
    });

    if (!findUser) {
      return res.status(401).send({
        message: "Token Is Not Valid",
      });
    }

    next();
  } catch (err) {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

const authJwt = {
  userVerifyToken,
  adminVerifyToken,
};

module.exports = authJwt;
