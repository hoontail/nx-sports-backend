const db = require("../../models");
const SportsConfigs = db.sports_configs;
const SportsBonusOdds = db.sports_bonus_odds;
const SportsCombine = db.sports_combine;
const SportsMarket = db.sports_market;

const helpers = require("../../helpers");
const moment = require("moment");

exports.updateSportsConfigForAdmin = async (req, res) => {
  const {
    singleMinBetAmount,
    multiMinBetAmount,
    singleMaxBetAmount,
    multiMaxBetAmount,
    singleMaxWinAmount,
    multiMaxWinAmount,
    cancelAfterBetTime,
    cancelBeforeStartTime,
    cancelDailyCount,
    cancelMessage,
    singleMinusOdds,
    twoMinusOdds,
    alertBetAmount,
    losePointPercentage,
  } = req.body;

  if (
    singleMinBetAmount === "" ||
    multiMinBetAmount === "" ||
    singleMaxBetAmount === "" ||
    multiMaxBetAmount === "" ||
    singleMaxWinAmount === "" ||
    multiMaxWinAmount === "" ||
    cancelAfterBetTime === "" ||
    cancelBeforeStartTime === "" ||
    cancelDailyCount === "" ||
    cancelMessage === "" ||
    singleMinusOdds === "" ||
    twoMinusOdds === "" ||
    losePointPercentage === ""
  ) {
    return res.status(400).send({
      message: "입력칸을 모두 입력해주세요",
    });
  }

  try {
    await SportsConfigs.update(
      {
        single_min_bet_amount: singleMinBetAmount,
        multi_min_bet_amount: multiMinBetAmount,
        single_max_bet_amount: singleMaxBetAmount,
        mulit_max_bet_amount: multiMaxBetAmount,
        single_max_win_amount: singleMaxWinAmount,
        multi_max_win_amount: multiMaxWinAmount,
        cancel_after_bet_time: cancelAfterBetTime,
        cancel_before_start_time: cancelBeforeStartTime,
        cancel_daily_count: cancelDailyCount,
        cancel_message: cancelMessage,
        single_minus_odds: singleMinusOdds,
        two_minus_odds: twoMinusOdds,
        alert_bet_amount: alertBetAmount,
        lose_point_percentage: losePointPercentage,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id: 1,
        },
      }
    );

    return res.status(200).send({
      message: "스포츠 게임 설정이 수정되었습니다",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateBonusForAdmin = async (req, res) => {
  const { id, folderCount, odds, minOdds, errorMessage, status } = req.body;
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

    if (findBonus.folder_count !== folderCount) {
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
    }

    await SportsBonusOdds.update(
      {
        folder_count: folderCount,
        odds,
        min_odds: minOdds,
        error_message: errorMessage,
        status,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(200).send({
      message: "보너스가 수정되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateCombineForAdmin = async (req, res) => {
  const {
    id,
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

    const findCombine = await SportsCombine.findOne({
      where: {
        id,
      },
    });

    if (!findCombine) {
      return res.status(400).send({
        message: "존재하지 않는 조합 설정입니다",
      });
    }

    await SportsCombine.update(
      {
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
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(200).send({
      message: "스포츠 조합 설정이 수정되었습니다",
    });
  } catch (err) {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.updateMarketForAdmin = async (req, res) => {
  const { id, isCross, isWinlose, isHandicap, isSpecial, isInplay, order } =
    req.body;

  try {
    const findMarket = await SportsMarket.findOne({
      where: {
        id,
      },
    });

    if (!findMarket) {
      return res.status(400).send({
        message: "존재하지 않는 마켓입니다",
      });
    }

    await SportsMarket.update(
      {
        is_cross: isCross,
        is_winlose: isWinlose,
        is_handicap: isHandicap,
        is_special: isSpecial,
        is_inplay: isInplay,
        order,
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id,
        },
      }
    );

    return res.status(200).send({
      message: "스포츠 마켓이 수정되었습니다",
    });
  } catch (err) {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
