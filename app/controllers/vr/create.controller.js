const db = require("../../models");
const VrCombine = db.vr_combine;
const VrSportsConfigs = db.vr_sports_configs;
const VrBonusOdds = db.vr_bonus_odds;

exports.createVrCombineForAdmin = async (req, res) => {
  const {
    sportsName,
    matchType,
    marketType1,
    betType1,
    marketType2,
    betType2,
    errorMessage,
    status,
  } = req.body;

  try {
    if (
      !sportsName ||
      !matchType ||
      !marketType1 ||
      !betType1 ||
      !marketType2 ||
      !betType2 ||
      !errorMessage
    ) {
      return res.status(400).send({
        message: "필수 입력 항목을 모두 입력해주세요",
      });
    }

    let findVrSportsConfig;

    if (sportsName !== "전체") {
      findVrSportsConfig = await VrSportsConfigs.findOne({
        where: {
          sports_name: sportsName,
        },
      });

      if (!findVrSportsConfig) {
        return res.status(400).send({
          message: "존재하지 않는 종목입니다",
        });
      }
    }

    await VrCombine.create({
      sports_name: sportsName,
      sports_name_kr: findVrSportsConfig
        ? findVrSportsConfig.sports_name_kr
        : "전체",
      match_type: matchType,
      market_type_1: marketType1,
      bet_type_1: betType1,
      market_type_2: marketType2,
      bet_type_2: betType2,
      error_message: errorMessage,
      status,
    });

    return res.status(200).send({
      message: "조합이 등록되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.createBonusForAdmin = async (req, res) => {
  const {
    folderCount,
    odds,
    minOdds,
    errorMessage,
    homeName,
    awayName,
    status,
  } = req.body;
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

    if (homeName === "") {
      return res.status(400).send({
        message: "홈팀명을 입력해주세요",
      });
    }

    if (awayName === "") {
      return res.status(400).send({
        message: "원정팀명을 입력해주세요",
      });
    }

    const findSamefolder = await VrBonusOdds.findOne({
      where: {
        folder_count: folderCount,
      },
    });

    if (findSamefolder) {
      return res.status(400).send({
        message: "이미 존재하는 폴더 수의 보너스입니다",
      });
    }

    await VrBonusOdds.create({
      folder_count: folderCount,
      odds,
      min_odds: minOdds,
      error_message: errorMessage,
      home_name: homeName,
      away_name: awayName,
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
