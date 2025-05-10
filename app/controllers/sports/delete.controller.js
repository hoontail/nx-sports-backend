const db = require("../../models");
const SportsBonusOdds = db.sports_bonus_odds;
const SportsCombine = db.sports_combine;
const SportsBetHistory = db.sports_bet_history;

const moment = require("moment");
const utils = require("../../utils");

exports.deleteBonusForAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const findBonus = await SportsBonusOdds.findOne({
      where: {
        id,
      },
    });

    if (!findBonus) {
      return res.status(400).send({
        message: "존재하지 않는 보너스입니다",
      });
    }

    await SportsBonusOdds.destroy({
      where: {
        id,
      },
    });

    return res.status(200).send({
      message: "보너스가 삭제되었습니다",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.deleteCombineForAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const findCombine = await SportsCombine.findOne({
      where: {
        id,
      },
    });

    if (!findCombine) {
      return res.status(400).send({
        message: "존재하지 않는 스포츠 조합 설정입니다",
      });
    }

    await SportsCombine.destroy({
      where: {
        id,
      },
    });

    return res.status(200).send({
      message: "스포츠 조합 설정이 삭제되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.deleteSportsBetHistoryForUser = async (req, res) => {
  const { key } = req.params;
  const ip = utils.getIp(req);

  try {
    const findHistory = await SportsBetHistory.findOne({
      where: {
        key,
        username: req.username,
      },
    });

    if (!findHistory) {
      return res.status(400).send({
        message: "존재하지 않는 베팅내역입니다",
      });
    }

    await SportsBetHistory.update(
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
      message: "베팅내역이 삭제되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
