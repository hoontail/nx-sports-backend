const db = require("../../models");
const Op = db.Sequelize.Op;
const MiniBetHistory = db.mini_bet_history;

const utils = require("../../utils");
const moment = require("moment");

exports.deleteHistoryForUser = async (req, res) => {
  const { key } = req.params;
  const ip = utils.getIp(req);

  try {
    if (key !== "all") {
      const findHistory = await MiniBetHistory.findOne({
        where: {
          username: req.username,
          key,
          is_delete: 0,
        },
      });

      if (!findHistory) {
        return res.status(400).send({
          message: "존재하지 않는 베팅 내역입니다",
        });
      }

      await MiniBetHistory.update(
        {
          is_delete: 1,
          deleted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          deleted_ip: ip,
        },
        {
          where: {
            key,
          },
        }
      );
    } else {
      await MiniBetHistory.update(
        {
          is_delete: 1,
          deleted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          deleted_ip: ip,
        },
        {
          where: {
            username: req.username,
            is_delete: 0,
          },
        }
      );
    }

    return res.status(200).send({
      message: "베팅 내역이 삭제되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.deleteMultiHistoryForUser = async (req, res) => {
  const { key } = req.body;
  const ip = utils.getIp(req);

  try {
    const keyArr = JSON.parse(key);

    if (keyArr.length === 0) {
      return res.status(400).send({
        message: "삭제하실 내역을 선택해주세요",
      });
    }

    const findHistory = await MiniBetHistory.findAll({
      where: {
        username: req.username,
        key: keyArr,
      },
    });

    if (findHistory.length !== keyArr.length) {
      return res.status(400).send({
        message: "존재하지 않는 베팅내역입니다",
      });
    }

    for (const history of findHistory) {
      if (history.status === 0) {
        return res.status(400).send({
          message: "결과 대기 중인 내역은 삭제 할 수 없습니다",
        });
      }
    }

    await MiniBetHistory.update(
      {
        is_delete: 1,
        deleted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        deleted_ip: ip,
      },
      {
        where: {
          key: keyArr,
        },
      }
    );

    return res.status(200).send({
      message: "베팅내역이 삭제되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
