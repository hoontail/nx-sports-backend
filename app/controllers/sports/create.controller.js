const db = require("../../models");
const SportsBonusOdds = db.sports_bonus_odds;
const SportsCombine = db.sports_combine;
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsMarket = db.sports_market;
const helpers = require("../../helpers");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

exports.createBonusForAdmin = async (req, res) => {
  const {
    folderCount,
    odds,
    minOdds,
    errorMessage,
    status,
    homeName,
    awayName,
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

exports.createMatchForAdmin = async (req, res) => {
  const { sportsName, startTime, country, league, home, away, oddsData } =
    req.body;

  try {
    if (!sportsName || !startTime || !country || !league || !home || !away) {
      return res.status(400).send({
        message: "필수 입력 항목을 모두 작성해주세요",
      });
    }

    const getMatchId = async () => {
      const id =
        parseInt(uuidv4().replace(/-/g, "").slice(0, 12), 16) % 1000000000;

      const findSameIdMatch = await SportsMatches.findOne({
        where: {
          match_id: id,
        },
      });

      if (findSameIdMatch) {
        return await getMatchId();
      }

      return id;
    };

    const matchId = await getMatchId();

    await db.sequelize.transaction(async (t) => {
      await SportsMatches.create(
        {
          match_id: matchId,
          sports_name: sportsName,
          sports_name_kr: helpers.translateSportsName(sportsName),
          prematch_id: 0,
          inplay_id: 0,
          status_id: 0,
          status_kr: "경기전",
          period_id: 0,
          is_inplay_ing: 0,
          league_name: league,
          home_name: home,
          away_name: away,
          country: country,
          country_kr: country,
          start_datetime: startTime,
          created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          score: '{"home":{},"away":{}}',
        },
        {
          transaction: t,
        }
      );

      const oddsArr = JSON.parse(oddsData);
      const createOddsData = [];

      for (const odds of oddsArr) {
        const findMarket = await SportsMarket.findOne({
          where: {
            market_id: odds.marketId,
          },
          transaction: t,
        });

        if (!findMarket) {
          return res.status(400).send({
            message: "존재하지 않는 마켓입니다",
          });
        }

        const hasDrawOdds =
          findMarket.type === "승무패" || findMarket.type === "더블찬스";
        const hasOddsLine =
          findMarket.type === "핸디캡" || findMarket.type === "언더오버";

        if (hasDrawOdds && !odds.drawOdds) {
          return res.status(400).send({
            message: "무배당을 입력해주세요",
          });
        }

        if (hasOddsLine && !odds.drawOdds) {
          return res.status(400).send({
            message: "기준점을 입력해주세요",
          });
        }

        createOddsData.push({
          match_id: matchId,
          market_id: findMarket.market_id,
          home_odds: odds.homeOdds,
          away_odds: odds.awayOdds,
          draw_odds: hasDrawOdds ? odds.drawOdds : null,
          odds_line: hasOddsLine ? odds.drawOdds : null,
          odds_key: `${matchId}_${findMarket.market_id}${
            hasOddsLine ? `_${odds.drawOdds}` : ""
          }`,
          is_market_stop: 0,
          is_odds_stop: 0,
          is_auto: 0,
        });
      }

      await SportsOdds.bulkCreate(createOddsData, {
        transaction: t,
      });
    });

    return res.status(200).send({
      message: "경기가 등록되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.createOddsForAdmin = async (req, res) => {
  const { matchId, marketId, homeOdds, drawOdds, awayOdds } = req.body;

  try {
    const findMatch = await SportsMatches.findOne({
      where: {
        match_id: matchId,
      },
    });

    if (!findMatch) {
      return res.status(400).send({
        message: "존재하지 않는 경기입니다",
      });
    }

    const findMarket = await SportsMarket.findOne({
      where: {
        market_id: marketId,
      },
    });

    if (!findMarket) {
      return res.status(400).send({
        message: "존재하지 않는 마켓입니다",
      });
    }

    const hasDrawOdds =
      findMarket.type === "승무패" || findMarket.type === "더블찬스";
    const hasOddsLine =
      findMarket.type === "핸디캡" || findMarket.type === "언더오버";

    if (hasDrawOdds && !drawOdds) {
      return res.status(400).send({
        message: "무배당을 입력해주세요",
      });
    }

    if (hasOddsLine && !drawOdds) {
      return res.status(400).send({
        message: "기준점을 입력해주세요",
      });
    }

    const findSameMarket = await SportsOdds.findOne({
      where: {
        odds_key: `${matchId}_${marketId}${hasOddsLine ? `_${drawOdds}` : ""}`,
      },
    });

    if (findSameMarket) {
      return res.status(400).send({
        message: "이미 존재하는 마켓입니다",
      });
    }

    await SportsOdds.create({
      match_id: matchId,
      market_id: marketId,
      home_odds: homeOdds,
      away_odds: awayOdds,
      draw_odds: hasDrawOdds ? drawOdds : null,
      odds_line: hasOddsLine ? drawOdds : null,
      odds_key: `${matchId}_${marketId}${hasOddsLine ? `_${drawOdds}` : ""}`,
      is_market_stop: 0,
      is_odds_stop: 0,
      is_auto: 0,
    });

    return res.status(200).send({
      message: "배당이 등록되었습니다",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
