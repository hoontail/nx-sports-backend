const db = require("../../models");
const Op = db.Sequelize.Op;
const VrCombine = db.vr_combine;
const VrBonusOdds = db.vr_bonus_odds;
const VrBetHistory = db.vr_bet_history;

const moment = require("moment");
const utils = require("../../utils");

exports.deleteVrCombineForAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const findCombine = await VrCombine.findOne({
      where: {
        id,
      },
    });

    if (!findCombine) {
      return res.status(200).send({
        message: "존재하지 않는 조합입니다",
      });
    }

    await VrCombine.destroy({
      where: {
        id,
      },
    });

    return res.status(200).send({
      message: "조합이 삭제되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
exports.deleteBonusForAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const findBonus = await VrBonusOdds.findOne({
      where: {
        id,
      },
    });

    if (!findBonus) {
      return res.status(400).send({
        message: "존재하지 않는 보너스입니다",
      });
    }

    await VrBonusOdds.destroy({
      where: {
        id,
      },
    });

    return res.status(200).send({
      message: "보너스가 삭제되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.deleteVrBetHistoryForUser = async (req, res) => {
  const { key } = req.params;
  const ip = utils.getIp(req);

  try {
    if (key !== "all") {
      const findHistory = await VrBetHistory.findOne({
        where: {
          key,
          username: req.username,
          is_delete: 0,
        },
      });

      if (!findHistory) {
        return res.status(400).send({
          message: "존재하지 않는 베팅내역입니다",
        });
      }

      if (findHistory.status === 0) {
        return res.status(400).send({
          message: "결과 대기 중인 내역은 삭제할 수 없습니다",
        });
      }

      await VrBetHistory.update(
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
      await VrBetHistory.update(
        {
          is_delete: 1,
          deleted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          deleted_ip: ip,
        },
        {
          where: {
            username: req.username,
            is_delete: 0,
            status: {
              [Op.ne]: 0,
            },
          },
        }
      );
    }

    return res.status(200).send({
      message: "베팅내역이 삭제되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.deleteMultiVrBetHistoryForUser = async (req, res) => {
  const { key } = req.body;
  const ip = utils.getIp(req);

  try {
    const keyArr = JSON.parse(key);

    if (keyArr.length === 0) {
      return res.status(400).send({
        message: "삭제하실 내역을 선택해주세요",
      });
    }

    const findHistory = await VrBetHistory.findAll({
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

    await VrBetHistory.update(
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
