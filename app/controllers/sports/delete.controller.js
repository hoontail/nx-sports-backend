const db = require("../../models");
const SportsBonusOdds = db.sports_bonus_odds;
const SportsCombine = db.sports_combine;

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
