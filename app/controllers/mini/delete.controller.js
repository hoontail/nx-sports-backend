const db = require("../../models");
const Op = db.Sequelize.Op;
const MiniBetHistory = db.mini_bet_history;

const utils = require("../../utils");
const moment = require("moment");

exports.deleteHistoryForUser = async (req, res) => {
  const { key } = req.params;
  const ip = utils.getIp(req);

  try {
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

    return res.status(200).send({
      message: "베팅 내역이 삭제되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
