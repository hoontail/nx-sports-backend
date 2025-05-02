const db = require("../../models");
const SportsBonusOdds = db.sports_bonus_odds;
const SportsCombine = db.sports_combine;
const helpers = require("../../helpers");

exports.createBonusForAdmin = async (req, res) => {
  const { folderCount, odds, minOdds, errorMessage, status } = req.body;
  try {
    if (!folderCount || folderCount === "") {
      return res.status(400).send({
        message: "폴더 수를 입력해주세요",
      });
    }

    if (odds === "") {
      return res.status(400).send({
        message: "배당을 입력해주세요",
      });
    }

    if (minOdds === "") {
      return res.status(400).send({
        message: "최소 배당을 입력해주세요",
      });
    }

    if (errorMessage === "") {
      return res.status(400).send({
        message: "에러 메세지를 입력해주세요",
      });
    }

    const findSamefolder = await SportsBonusOdds.findOne({
      where: {
        folder_count: folderCount,
      },
    });

    if (findSamefolder) {
      return res.status(400).send({
        message: "이미 존재하는 폴더 수의 보너스입니다",
      });
    }

    await SportsBonusOdds.create({
      folder_count: folderCount,
      odds,
      min_odds: minOdds,
      error_message: errorMessage,
      status,
    });

    return res.status(200).send({
      message: "보너스가 등록되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.createCombineForAdmin = async (req, res) => {
  const {
    gameType,
    sportsName,
    leagueType,
    matchType,
    marketType1,
    periodType1,
    betType1,
    marketType2,
    periodType2,
    betType2,
    errorMessage,
    status,
  } = req.body;

  try {
    if (
      !gameType ||
      !sportsName ||
      !leagueType ||
      !matchType ||
      !marketType1 ||
      !periodType1 ||
      !betType1 ||
      !marketType2 ||
      !periodType2 ||
      !betType2 ||
      !errorMessage
    ) {
      return res.status(400).send({
        message: "필수 입력 항목을 모두 입력해주세요",
      });
    }

    await SportsCombine.create({
      game_type: gameType,
      sports_name: sportsName,
      sports_name_kr: helpers.translateSportsName(sportsName),
      league_type: leagueType,
      match_type: matchType,
      market_type_1: marketType1,
      period_type_1: periodType1,
      bet_type_1: betType1,
      market_type_2: marketType2,
      period_type_2: periodType2,
      bet_type_2: betType2,
      error_message: errorMessage,
      status,
    });

    return res.status(200).send({
      message: "스포츠 조합 설정이 등록되었습니다",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
