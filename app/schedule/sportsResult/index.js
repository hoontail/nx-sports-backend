const axios = require("axios");
const db = require("../../models");
const Op = db.Sequelize.Op;
const Users = db.up_users;
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsMarket = db.sports_market;
const SportsBetHistory = db.sports_bet_history;
const SportsBetDetail = db.sports_bet_detail;
const SportsConfigs = db.sports_configs;
const BalanceLogs = db.balance_logs;
const RollingPoints = db.rolling_points;

const moment = require("moment");

exports.sportsResultProcess = async () => {
  try {
    console.log("스포츠 결과처리 시작");

    const findFinishedMatches = await SportsMatches.findAll({
      include: {
        include: {
          model: SportsMarket,
        },
        model: SportsOdds,
      },
      where: {
        status_kr: "경기종료",
        is_result: 0,
      },
    });

    const findSpecialMatches = await SportsMatches.findAll({
      include: {
        include: {
          model: SportsMarket,
        },
        model: SportsOdds,
      },
      where: {
        status_kr: "경기중",
        sports_name: [
          "soccer",
          "baseball",
          "icehockey",
          "basketball",
          "volleyball",
        ],
      },
    });

    const findCanceledMatches = await SportsMatches.findAll({
      where: {
        status_id: [3, 4, 5, 6, 7, 8, 9, 10, 11, 80, 99],
        is_result: 0,
      },
    });

    await Promise.all(
      findFinishedMatches.map(async (match) => {
        switch (match.sports_name) {
          case "soccer":
            return soccerResultProcess(match);
          case "baseball":
            return baseballResultProcess(match);
          case "icehockey":
            return icehockeyResultProcess(match);
          case "basketball":
            return basketballResultProcess(match);
          case "volleyball":
            return volleyballResultProcess(match);
          case "tabletennis":
            return tabletennisResultProcess(match);
          case "tennis":
            return tennisResultProcess(match);
          case "americanfootball":
            return americanfootballResultProcess(match);
          case "boxingufc":
            return boxingResultProcess(match);
          case "esports":
            return esportsResultProcess(match);
        }
      })
    );

    await Promise.all(
      findSpecialMatches.map(async (match) => {
        switch (match.sports_name) {
          case "soccer":
            return soccerResultProcess(match);
          case "baseball":
            return baseballResultProcess(match);
          case "icehockey":
            return icehockeyResultProcess(match);
          case "basketball":
            return basketballResultProcess(match);
          case "volleyball":
            return volleyballResultProcess(match);
        }
      })
    );

    findCanceledMatches.forEach((match) => {
      canceledResultProcess(match);
    });
  } catch (err) {
    console.log(err);
    console.log("스포츠 결과처리 실패");
  }
};

// 축구 결과처리
const soccerResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;
    const marketPeriod = odds.sports_market.period;
    const oddsLine = parseFloat(odds.odds_line);

    if (match.period_id < 102 && marketPeriod === "전반전") continue;

    if (match.status_kr !== "경기종료" && marketPeriod === "후반전") continue;

    if (marketPeriod === "연장포함") {
      homeScore = parseInt(resultJson.home.score);
      awayScore = parseInt(resultJson.away.score);
    }

    if (marketPeriod === "전반전") {
      homeScore = parseInt(resultJson.home["1"]);
      awayScore = parseInt(resultJson.away["1"]);
    }

    if (marketPeriod === "후반전") {
      homeScore = parseInt(resultJson.home["2"]);
      awayScore = parseInt(resultJson.away["2"]);
    }

    if (marketType === "승무패" || marketType === "더블찬스") {
      if (homeScore > awayScore) {
        result = 1;
      } else if (homeScore === awayScore) {
        result = 2;
      } else if (homeScore < awayScore) {
        result = 0;
      }
    } else if (marketType === "양팀모두득점") {
      if (homeScore > 0 && awayScore > 0) {
        result = 1;
      } else {
        result = 0;
      }
    } else if (marketType === "핸디캡") {
      if (homeScore + oddsLine > awayScore) {
        result = 1;
      } else if (homeScore + oddsLine < awayScore) {
        result = 0;
      } else {
        result = 2;
      }
    } else if (marketType === "언더오버") {
      if (homeScore + awayScore > oddsLine) {
        result = 1;
      } else if (homeScore + awayScore < oddsLine) {
        result = 0;
      } else {
        result = 2;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 야구 결과처리
const baseballResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;
    const marketPeriod = odds.sports_market.period;
    const oddsLine = parseFloat(odds.odds_line);

    if (match.status_kr !== "경기종료") {
      let endMarketArr = [];
      if (match.period_id > 201) {
        endMarketArr.push("1이닝");
      }
      if (match.period_id > 202) {
        endMarketArr.push("2이닝");
      }
      if (match.period_id > 203) {
        endMarketArr.push("3이닝", "3이닝합계");
      }
      if (match.period_id > 204) {
        endMarketArr.push("4이닝");
      }
      if (match.period_id > 205) {
        endMarketArr.push("5이닝", "5이닝합계");
      }
      if (match.period_id > 206) {
        endMarketArr.push("6이닝");
      }
      if (match.period_id > 207) {
        endMarketArr.push("7이닝", "7이닝합계");
      }
      if (match.period_id > 208) {
        endMarketArr.push("8이닝");
      }

      if (!endMarketArr.includes(marketPeriod)) {
        continue;
      }
    }

    if (marketPeriod === "연장포함") {
      homeScore = parseInt(resultJson.home.score);
      awayScore = parseInt(resultJson.away.score);
    } else if (marketPeriod === "1이닝") {
      homeScore = parseInt(resultJson.home["1"]);
      awayScore = parseInt(resultJson.away["1"]);
    } else if (marketPeriod === "2이닝") {
      homeScore = parseInt(resultJson.home["2"]);
      awayScore = parseInt(resultJson.away["2"]);
    } else if (marketPeriod === "3이닝") {
      homeScore = parseInt(resultJson.home["3"]);
      awayScore = parseInt(resultJson.away["3"]);
    } else if (marketPeriod === "4이닝") {
      homeScore = parseInt(resultJson.home["4"]);
      awayScore = parseInt(resultJson.away["4"]);
    } else if (marketPeriod === "5이닝") {
      homeScore = parseInt(resultJson.home["5"]);
      awayScore = parseInt(resultJson.away["5"]);
    } else if (marketPeriod === "6이닝") {
      homeScore = parseInt(resultJson.home["6"]);
      awayScore = parseInt(resultJson.away["6"]);
    } else if (marketPeriod === "7이닝") {
      homeScore = parseInt(resultJson.home["7"]);
      awayScore = parseInt(resultJson.away["7"]);
    } else if (marketPeriod === "8이닝") {
      homeScore = parseInt(resultJson.home["8"]);
      awayScore = parseInt(resultJson.away["8"]);
    } else if (marketPeriod === "9이닝") {
      homeScore = parseInt(resultJson.home["9"]);
      awayScore = parseInt(resultJson.away["9"]);
    } else if (marketPeriod === "3이닝합계") {
      homeScore =
        parseInt(resultJson.home["1"]) +
        parseInt(resultJson.home["2"]) +
        parseInt(resultJson.home["3"]);
      awayScore =
        parseInt(resultJson.away["1"]) +
        parseInt(resultJson.away["2"]) +
        parseInt(resultJson.away["3"]);
    } else if (marketPeriod === "5이닝합계") {
      homeScore =
        parseInt(resultJson.home["1"]) +
        parseInt(resultJson.home["2"]) +
        parseInt(resultJson.home["3"]) +
        parseInt(resultJson.home["4"]) +
        parseInt(resultJson.home["5"]);
      awayScore =
        parseInt(resultJson.away["1"]) +
        parseInt(resultJson.away["2"]) +
        parseInt(resultJson.away["3"]) +
        parseInt(resultJson.away["4"]) +
        parseInt(resultJson.away["5"]);
    } else if (marketPeriod === "7이닝합계") {
      homeScore =
        parseInt(resultJson.home["1"]) +
        parseInt(resultJson.home["2"]) +
        parseInt(resultJson.home["3"]) +
        parseInt(resultJson.home["4"]) +
        parseInt(resultJson.home["5"]) +
        parseInt(resultJson.home["6"]) +
        parseInt(resultJson.home["7"]);
      awayScore =
        parseInt(resultJson.away["1"]) +
        parseInt(resultJson.away["2"]) +
        parseInt(resultJson.away["3"]) +
        parseInt(resultJson.away["4"]) +
        parseInt(resultJson.away["5"]) +
        parseInt(resultJson.away["6"]) +
        parseInt(resultJson.away["7"]);
    }

    if (marketType === "승패" || marketType === "승무패") {
      // 승패, 승무패
      if (homeScore > awayScore) {
        result = 1;
      } else if (homeScore < awayScore) {
        result = 0;
      } else if (homeScore === awayScore) {
        result = 2;
      }
    } else if (marketType === "핸디캡") {
      // 핸디캡
      if (homeScore + oddsLine > awayScore) {
        result = 1;
      } else if (homeScore + oddsLine < awayScore) {
        result = 0;
      } else {
        result = 2;
      }
    } else if (marketType === "언더오버") {
      // 언더오버
      if (homeScore + awayScore > oddsLine) {
        result = 1;
      } else if (homeScore + awayScore < oddsLine) {
        result = 0;
      } else {
        result = 2;
      }
    } else if (marketType === "득점") {
      // 득점
      if (homeScore + awayScore > 0) {
        result = 1;
      } else {
        result = 0;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 아이스하키 결과처리
const icehockeyResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;
    const marketPeriod = odds.sports_market.period;
    const oddsLine = parseFloat(odds.odds_line);

    if (match.status_kr !== "경기종료") {
      let endMarketArr = [];
      if (match.period_id > 401 && match.period_id !== 404) {
        endMarketArr.push("1피리어드");
      }
      if (match.period_id > 402 && match.period_id !== 404) {
        endMarketArr.push("2피리어드");
      }
      if (match.period_id > 403 && match.period_id !== 404) {
        endMarketArr.push("3피리어드");
      }

      if (!endMarketArr.includes(marketPeriod)) {
        continue;
      }
    }

    if (marketPeriod === "연장포함") {
      homeScore = parseInt(resultJson.home.score);
      awayScore = parseInt(resultJson.away.score);
    } else if (marketPeriod === "1피리어드") {
      homeScore = parseInt(resultJson.home["1"]);
      awayScore = parseInt(resultJson.away["1"]);
    } else if (marketPeriod === "2피리어드") {
      homeScore = parseInt(resultJson.home["2"]);
      awayScore = parseInt(resultJson.away["2"]);
    } else if (marketPeriod === "3피리어드") {
      homeScore = parseInt(resultJson.home["3"]);
      awayScore = parseInt(resultJson.away["3"]);
    }

    if (marketType === "승패" || marketType === "승무패") {
      if (homeScore > awayScore) {
        result = 1;
      } else if (homeScore < awayScore) {
        result = 0;
      } else if (homeScore === awayScore) {
        result = 2;
      }
    } else if (marketType === "핸디캡") {
      if (homeScore + oddsLine > awayScore) {
        result = 1;
      } else if (homeScore + oddsLine < awayScore) {
        result = 0;
      } else {
        result = 2;
      }
    } else if (marketType === "언더오버") {
      if (homeScore + awayScore > oddsLine) {
        result = 1;
      } else if (homeScore + awayScore < oddsLine) {
        result = 0;
      } else {
        result = 2;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 농구 결과처리
const basketballResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;
    const marketPeriod = odds.sports_market.period;
    const oddsLine = parseFloat(odds.odds_line);

    if (match.status_kr !== "경기종료") {
      let endMarketArr = [];
      if (match.period_id > 301) {
        endMarketArr.push("1쿼터");
      }
      if (match.period_id > 302) {
        endMarketArr.push("2쿼터", "전반전");
      }
      if (match.period_id > 303 && match.period_id !== 305) {
        endMarketArr.push("3쿼터");
      }
      if (match.period_id > 304 && match.period_id !== 305) {
        endMarketArr.push("4쿼터");
      }

      if (!endMarketArr.includes(marketPeriod)) {
        continue;
      }
    }

    if (marketPeriod === "연장포함") {
      homeScore = parseInt(resultJson.home.score);
      awayScore = parseInt(resultJson.away.score);
    } else if (marketType === "전반전") {
      homeScore =
        parseInt(resultJson.home["1"]) + parseInt(resultJson.home["2"]);
      awayScore =
        parseInt(resultJson.away["1"]) + parseInt(resultJson.away["2"]);
    } else if (marketType === "1쿼터") {
      homeScore = parseInt(resultJson.home["1"]);
      awayScore = parseInt(resultJson.away["1"]);
    } else if (marketType === "2쿼터") {
      homeScore = parseInt(resultJson.home["2"]);
      awayScore = parseInt(resultJson.away["2"]);
    } else if (marketType === "3쿼터") {
      homeScore = parseInt(resultJson.home["3"]);
      awayScore = parseInt(resultJson.away["3"]);
    } else if (marketType === "4쿼터") {
      homeScore = parseInt(resultJson.home["4"]);
      awayScore = parseInt(resultJson.away["4"]);
    }

    if (marketType === "승패" || marketType === "승무패") {
      if (homeScore > awayScore) {
        result = 1;
      } else if (homeScore < awayScore) {
        result = 0;
      } else if (homeScore === awayScore) {
        result = 2;
      }
    } else if (marketType === "핸디캡") {
      if (homeScore + oddsLine > awayScore) {
        result = 1;
      } else if (homeScore + oddsLine < awayScore) {
        result = 0;
      } else {
        result = 2;
      }
    } else if (marketType === "언더오버") {
      if (homeScore + awayScore > oddsLine) {
        result = 1;
      } else if (homeScore + awayScore < oddsLine) {
        result = 0;
      } else {
        result = 2;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 배구 결과처리
const volleyballResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore =
    parseInt(resultJson.home["1"]) +
    parseInt(resultJson.home["2"]) +
    parseInt(resultJson.home["3"]) +
    parseInt(resultJson.home["4"]) +
    parseInt(resultJson.home["5"]);
  let awayScore =
    parseInt(resultJson.away["1"]) +
    parseInt(resultJson.away["2"]) +
    parseInt(resultJson.away["3"]) +
    parseInt(resultJson.away["4"]) +
    parseInt(resultJson.away["5"]);
  let homeSetScore =
    parseInt(resultJson.home["1_set"]) +
    parseInt(resultJson.home["2_set"]) +
    parseInt(resultJson.home["3_set"]) +
    parseInt(resultJson.home["4_set"]) +
    parseInt(resultJson.home["5_set"]);
  let awaySetScore =
    parseInt(resultJson.away["1_set"]) +
    parseInt(resultJson.away["2_set"]) +
    parseInt(resultJson.away["3_set"]) +
    parseInt(resultJson.away["4_set"]) +
    parseInt(resultJson.away["5_set"]);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;
    const marketPeriod = odds.sports_market.period;
    const marketId = odds.market_id;
    const oddsLine = parseFloat(odds.odds_line);

    if (match.status_kr !== "경기종료") {
      let endMarketArr = [];
      if (match.period_id > 501) {
        endMarketArr.push("1세트");
      }
      if (match.period_id > 502) {
        endMarketArr.push("2세트");
      }
      if (match.period_id > 503) {
        endMarketArr.push("3세트");
      }
      if (match.period_id > 504) {
        endMarketArr.push("4세트");
      }

      if (!endMarketArr.includes(marketPeriod)) {
        continue;
      }
    }

    if (marketPeriod === "연장포함") {
      homeScore = parseInt(resultJson.home.score);
      awayScore = parseInt(resultJson.away.score);
      homeSetScore = parseInt(resultJson.home.score_set);
      awaySetScore = parseInt(resultJson.away.score_set);
    } else if (marketPeriod === "1세트") {
      homeScore = parseInt(resultJson.home["1"]);
      awayScore = parseInt(resultJson.away["1"]);
      homeSetScore = parseInt(resultJson.home["1_set"]);
      awaySetScore = parseInt(resultJson.away["1_set"]);
    } else if (marketPeriod === "2세트") {
      homeScore = parseInt(resultJson.home["2"]);
      awayScore = parseInt(resultJson.away["2"]);
      homeSetScore = parseInt(resultJson.home["2_set"]);
      awaySetScore = parseInt(resultJson.away["2_set"]);
    } else if (marketPeriod === "3세트") {
      homeScore = parseInt(resultJson.home["3"]);
      awayScore = parseInt(resultJson.away["3"]);
      homeSetScore = parseInt(resultJson.home["3_set"]);
      awaySetScore = parseInt(resultJson.away["3_set"]);
    } else if (marketPeriod === "4세트") {
      homeScore = parseInt(resultJson.home["4"]);
      awayScore = parseInt(resultJson.away["4"]);
      homeSetScore = parseInt(resultJson.home["4_set"]);
      awaySetScore = parseInt(resultJson.away["4_set"]);
    } else if (marketPeriod === "5세트") {
      homeScore = parseInt(resultJson.home["5"]);
      awayScore = parseInt(resultJson.away["5"]);
      homeSetScore = parseInt(resultJson.home["5_set"]);
      awaySetScore = parseInt(resultJson.away["5_set"]);
    }

    if (marketType === "승패" || marketType === "승무패") {
      if (homeSetScore > awaySetScore) {
        result = 1;
      } else if (homeSetScore < awaySetScore) {
        result = 0;
      } else {
        result = 2;
      }
    } else if (marketType === "핸디캡") {
      if (marketId === 18002) {
        // 세트 핸디캡
        if (homeSetScore + oddsLine > awaySetScore) {
          result = 1;
        } else if (homeSetScore + oddsLine < awaySetScore) {
          result = 0;
        } else {
          result = 2;
        }
      } else {
        if (homeScore + oddsLine > awayScore) {
          result = 1;
        } else if (homeScore + oddsLine < awayScore) {
          result = 0;
        } else {
          result = 2;
        }
      }
    } else if (marketType === "언더오버") {
      // 언더오버
      if (homeScore + awayScore > oddsLine) {
        result = 1;
      } else if (homeScore + awayScore < oddsLine) {
        result = 0;
      } else {
        result = 2;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 탁구 결과처리
const tabletennisResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore =
    parseInt(resultJson.home["1_set"]) +
    parseInt(resultJson.home["2_set"]) +
    parseInt(resultJson.home["3_set"]) +
    parseInt(resultJson.home["4_set"]) +
    parseInt(resultJson.home["5_set"]) +
    parseInt(resultJson.home["6_set"]) +
    parseInt(resultJson.home["7_set"]);
  let awayScore =
    parseInt(resultJson.away["1_set"]) +
    parseInt(resultJson.away["2_set"]) +
    parseInt(resultJson.away["3_set"]) +
    parseInt(resultJson.away["4_set"]) +
    parseInt(resultJson.away["5_set"]) +
    parseInt(resultJson.away["6_set"]) +
    parseInt(resultJson.away["7_set"]);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;
    const marketPeriod = odds.sports_market.period;

    if (marketPeriod === "연장포함") {
      homeScore = parseInt(resultJson.home.score_set);
      awayScore = parseInt(resultJson.away.score_set);
    }

    if (marketType === "승패") {
      if (homeScore > awayScore) {
        result = 1;
      } else if (homeScore < awayScore) {
        result = 0;
      } else if (homeScore === awayScore) {
        result = 2;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 테니스 결과처리
const tennisResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore =
    parseInt(resultJson.home["1"]) +
    parseInt(resultJson.home["2"]) +
    parseInt(resultJson.home["3"]) +
    parseInt(resultJson.home["4"]) +
    parseInt(resultJson.home["5"]);
  let awayScore =
    parseInt(resultJson.away["1"]) +
    parseInt(resultJson.away["2"]) +
    parseInt(resultJson.away["3"]) +
    parseInt(resultJson.away["4"]) +
    parseInt(resultJson.away["5"]);

  let homeSetScore =
    parseInt(resultJson.home["1_set"]) +
    parseInt(resultJson.home["2_set"]) +
    parseInt(resultJson.home["3_set"]) +
    parseInt(resultJson.home["4_set"]) +
    parseInt(resultJson.home["5_set"]);
  let awaySetScore =
    parseInt(resultJson.away["1_set"]) +
    parseInt(resultJson.away["2_set"]) +
    parseInt(resultJson.away["3_set"]) +
    parseInt(resultJson.away["4_set"]) +
    parseInt(resultJson.away["5_set"]);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;
    const marketPeriod = odds.sports_market.period;
    const oddsLine = parseFloat(odds.odds_line);

    if (marketPeriod === "연장포함") {
      homeScore = parseInt(resultJson.home.score);
      awayScore = parseInt(resultJson.away.score);
      homeSetScore = parseInt(resultJson.home.score_set);
      awaySetScore = parseInt(resultJson.away.score_set);
    }

    if (marketType === "승패") {
      if (homeSetScore > homeSetScore) {
        result = 1;
      } else if (homeSetScore < homeSetScore) {
        result = 0;
      } else if (homeSetScore === homeSetScore) {
        result = 2;
      }
    } else if (marketType === "핸디캡") {
      if (homeScore + oddsLine > awayScore) {
        result = 1;
      } else if (homeScore + oddsLine < awayScore) {
        result = 0;
      } else {
        result = 2;
      }
    } else if (marketType === "언더오버") {
      if (homeScore + awayScore > oddsLine) {
        result = 1;
      } else if (homeScore + awayScore < oddsLine) {
        result = 0;
      } else {
        result = 2;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 미식축구 결과처리
const americanfootballResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;
    const marketPeriod = odds.sports_market.period;
    const oddsLine = parseFloat(odds.odds_line);

    if (match.status_kr !== "경기종료") {
      let endMarketArr = [];
      if (match.period_id > 901) {
        endMarketArr.push("1쿼터");
      }

      if (match.period_id > 902) {
        endMarketArr.push("전반전");
      }

      if (!endMarketArr.includes(marketPeriod)) {
        continue;
      }
    }

    if (marketPeriod === "연장포함") {
      homeScore = parseInt(resultJson.home.score);
      awayScore = parseInt(resultJson.away.score);
    } else if (marketPeriod === "1쿼터") {
      homeScore = parseInt(resultJson.home["1"]);
      awayScore = parseInt(resultJson.away["1"]);
    } else if (marketPeriod === "전반전") {
      homeScore =
        parseInt(resultJson.home["1"]) + parseInt(resultJson.home["2"]);
      awayScore =
        parseInt(resultJson.away["1"]) + parseInt(resultJson.away["2"]);
    }

    if (marketType === "승패") {
      if (homeScore > awayScore) {
        result = 1;
      } else if (homeScore < awayScore) {
        result = 0;
      } else if (homeScore === awayScore) {
        result = 2;
      }
    } else if (marketType === "핸디캡") {
      if (homeScore + oddsLine > awayScore) {
        result = 1;
      } else if (homeScore + oddsLine < awayScore) {
        result = 0;
      } else {
        result = 2;
      }
    } else if (marketType === "언더오버") {
      if (homeScore + awayScore > oddsLine) {
        result = 1;
      } else if (homeScore + awayScore < oddsLine) {
        result = 0;
      } else {
        result = 2;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 복싱 결과처리
const boxingResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.score);
  let awayScore = parseInt(resultJson.away.score);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;

    if (marketType === "승패") {
      if (homeScore > awayScore) {
        result = 1;
      } else if (homeScore < awayScore) {
        result = 0;
      } else if (homeScore === awayScore) {
        result = 2;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 이스포츠 결과처리
const esportsResultProcess = async (match) => {
  const resultJson = JSON.parse(match.score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.score);
  let awayScore = parseInt(resultJson.away.score);

  for await (const odds of match.sports_odds) {
    const marketType = odds.sports_market.type;
    const marketPeriod = odds.sports_market.period;
    const oddsLine = parseFloat(odds.odds_line);

    if (marketPeriod === "1세트" && marketType === "승패") {
      homeScore = parseInt(resultJson.home["1"]);
      awayScore = parseInt(resultJson.away["1"]);
    } else if (
      marketPeriod === "1세트" &&
      (marketType === "킬 핸디캡" ||
        marketType === "킬 언더오버" ||
        marketType === "킬 합계")
    ) {
      homeScore = parseInt(resultJson.home["k1"]);
      awayScore = parseInt(resultJson.away["k1"]);
    } else if (marketPeriod === "1세트" && marketType === "첫용") {
      homeScore = parseInt(resultJson.home["f_d1"]);
      awayScore = parseInt(resultJson.away["f_d1"]);
    } else if (marketPeriod === "1세트" && marketType === "첫바론") {
      homeScore = parseInt(resultJson.home["f_b1"]);
      awayScore = parseInt(resultJson.away["f_b1"]);
    } else if (marketPeriod === "1세트" && marketType === "첫타워") {
      homeScore = parseInt(resultJson.home["f_t1"]);
      awayScore = parseInt(resultJson.away["f_t1"]);
    } else if (marketPeriod === "1세트" && marketType === "첫킬") {
      homeScore = parseInt(resultJson.home["f_k1"]);
      awayScore = parseInt(resultJson.away["f_k1"]);
    } else if (marketPeriod === "2세트" && marketType === "승패") {
      homeScore = parseInt(resultJson.home["2"]);
      awayScore = parseInt(resultJson.away["2"]);
    } else if (marketPeriod === "2세트" && marketType === "킬 합계") {
      homeScore = parseInt(resultJson.home["k2"]);
      awayScore = parseInt(resultJson.away["k2"]);
    } else if (marketPeriod === "3세트" && marketType === "승패") {
      homeScore = parseInt(resultJson.home["3"]);
      awayScore = parseInt(resultJson.away["3"]);
    } else if (marketPeriod === "3세트" && marketType === "킬 합계") {
      homeScore = parseInt(resultJson.home["k3"]);
      awayScore = parseInt(resultJson.away["k3"]);
    } else if (marketPeriod === "4세트" && marketType === "승패") {
      homeScore = parseInt(resultJson.home["4"]);
      awayScore = parseInt(resultJson.away["4"]);
    } else if (marketPeriod === "4세트" && marketType === "킬 합계") {
      homeScore = parseInt(resultJson.home["k4"]);
      awayScore = parseInt(resultJson.away["k4"]);
    } else if (marketPeriod === "5세트" && marketType === "승패") {
      homeScore = parseInt(resultJson.home["5"]);
      awayScore = parseInt(resultJson.away["5"]);
    } else if (marketPeriod === "5세트" && marketType === "킬 합계") {
      homeScore = parseInt(resultJson.home["k5"]);
      awayScore = parseInt(resultJson.away["k5"]);
    }

    if (
      ["승패", "첫용", "첫바론", "첫타워", "첫킬", "킬 합계"].includes(
        marketType
      )
    ) {
      if (homeScore > awayScore) {
        result = 1;
      } else if (homeScore < awayScore) {
        result = 0;
      } else if (homeScore === awayScore) {
        result = 2;
      }
    } else if (marketType === "핸디캡" || marketType === "킬 핸디캡") {
      if (homeScore + oddsLine > awayScore) {
        result = 1;
      } else if (homeScore + oddsLine < awayScore) {
        result = 0;
      } else {
        result = 2;
      }
    } else if (marketType === "언더오버" || marketType === "킬 언더오버") {
      if (homeScore + awayScore > oddsLine) {
        result = 1;
      } else if (homeScore + awayScore < oddsLine) {
        result = 0;
      } else {
        result = 2;
      }
    }

    // 배당 결과값 수정
    await updateOddsResult(odds, result);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 배당 결과값 수정
const updateOddsResult = async (odds, result) => {
  await SportsOdds.update(
    {
      result,
    },
    {
      where: {
        odds_key: odds.odds_key,
      },
    }
  );

  await betDetailResultProcess(odds, result);
};

// 경기 결과처리 수정
const updateMatchResult = async (match) => {
  try {
    if (match.status_kr === "경기종료") {
      await SportsMatches.update(
        {
          is_result: 1,
          resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          where: {
            match_id: match.match_id,
          },
        }
      );

      console.log(`스포츠 ${match.match_id} 결과처리 완료`);
    }
  } catch {
    console.log(`스포츠 ${match.match_id} 결과처리 실패`);
  }
};

// 베팅 상세내역 결과 처리
const betDetailResultProcess = async (odds, result) => {
  const findSportsBetDetail = await SportsBetDetail.findAll({
    include: {
      model: SportsMarket,
    },
    where: {
      odds_key: odds.odds_key,
      status: 0,
    },
  });

  if (findSportsBetDetail.length > 0) {
    for await (const x of findSportsBetDetail) {
      // 0: 대기, 1: 적중, 2: 낙첨, 3: 적특
      let status;

      const doubleChanceMap = {
        1: [1, 2], // 홈승 or 무
        2: [1, 0], // 홈승 or 원정
        0: [0, 2], // 원정 or 무
      };

      if (x.sports_market.type === "더블찬스") {
        status = doubleChanceMap[x.bet_type].includes(result) ? 1 : 2;
      } else {
        if (x.bet_type === result) {
          status = 1;
        } else if (!odds.draw_odds && result === 2) {
          status = 3;
        } else {
          status = 2;
        }
      }

      await SportsBetDetail.update(
        {
          score: odds.sports_match.score,
          result_type: result,
          status: status,
          resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          where: {
            id: x.id,
          },
        }
      );
      await this.betHistoryResultProcess(x.sports_bet_history_id);
    }
  }
};

// 경기취소 적특처리
const canceledResultProcess = async (match) => {
  try {
    const findSportsBetDetail = await SportsBetDetail.findAll({
      where: {
        match_id: match.match_id,
        status: 0,
      },
    });

    if (findSportsBetDetail.length > 0) {
      for await (const x of findSportsBetDetail) {
        await SportsBetDetail.update(
          {
            result_type: 3,
            status: 3,
            resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            where: {
              id: x.id,
            },
          }
        );

        await SportsOdds.update(
          {
            result: 3,
          },
          {
            where: {
              match_id: match.match_id,
            },
          }
        );

        await this.betHistoryResultProcess(x.sports_bet_history_id);
      }
    }

    await SportsMatches.update(
      {
        is_result: 1,
        resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          match_id: match.match_id,
        },
      }
    );

    console.log(`스포츠 ${match.match_id} 결과 취소 처리 완료`);
  } catch {
    console.log(`스포츠 ${match.match_id} 결과 취소 처리 실패`);
  }
};

// 베팅내역 결과 처리
exports.betHistoryResultProcess = async (historyId) => {
  const findSportsBetDetail = await SportsBetDetail.findAll({
    where: {
      sports_bet_history_id: historyId,
    },
  });

  const findSportsBetHistory = await SportsBetHistory.findOne({
    include: [
      {
        model: User,
      },
    ],
    where: {
      id: historyId,
      status: 0,
    },
  });

  if (findSportsBetDetail.length === 0 || !findSportsBetHistory) return;

  const findSportsConfigs = await SportsConfigs.findOne();

  // 낙첨처리
  if (findSportsBetDetail.some((x) => x.status === 2)) {
    await SportsBetHistory.update(
      {
        status: 2,
        resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id: historyId,
          status: 0,
        },
      }
    );

    // 낙첨 포인트 지급
    if (findSportsConfigs.lose_point_percentage > 0) {
      const losingPoint =
        (findSportsBetHistory.bet_amount *
          findSportsConfigs.lose_point_percentage) /
        100;

      if (losingPoint > 0) {
        await Users.increment(
          {
            rolling_point: losingPoint,
          },
          {
            where: {
              username: findSportsBetHistory.username,
            },
          }
        );

        const createRollingLogData = {
          username: findSportsBetHistory.username,
          amount: losingPoint,
          system_note: findSportsBetHistory.key,
          admin_id: "시스템",
          created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          vendor_key: "sports",
          record_type: "낙첨 보너스",
          rolling_percentage: findSportsConfigs.lose_point_percentage,
          prev_rolling_point: findSportsBetHistory.up_user.rolling_point,
          bet_amount: findSportsBetHistory.bet_amount,
        };

        await RollingPoints.create(createRollingLogData);
      }
    }

    return console.log(
      `${findSportsBetHistory.key} 스포츠 배팅내역 결과처리 완료`
    );
  }

  let totalOdds = 1;

  // 대기상태의 배당이 없을 때 결과처리
  if (!findSportsBetDetail.some((x) => x.status === 0)) {
    for await (const x of findSportsBetDetail) {
      if (x.status === 1) {
        totalOdds = totalOdds * x.odds;
      }
    }

    if (findSportsBetHistory.bonus_odds) {
      totalOdds = totalOdds * findSportsBetHistory.bonus_odds;
    }

    if (
      findSportsBetDetail.length === 1 &&
      findSportsConfigs.single_minus_odds > 0
    ) {
      totalOdds -= findSportsConfigs.single_minus_odds;

      if (totalOdds < 1) {
        totalOdds = 1;
      }
    } else if (
      findSportsBetDetail.length === 2 &&
      findSportsConfigs.two_minus_odds > 0
    ) {
      totalOdds -= findSportsConfigs.two_minus_odds;

      if (totalOdds < 1) {
        totalOdds = 1;
      }
    }

    totalOdds = totalOdds.toFixed(2);

    let winAmount = Math.floor(findSportsBetHistory.bet_amount * totalOdds);

    await SportsBetHistory.update(
      {
        win_amount: winAmount,
        status: 1,
        resulted_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        where: {
          id: historyId,
          status: 0,
        },
      }
    );

    await Users.increment(
      {
        balance: winAmount,
      },
      {
        where: {
          username: findSportsBetHistory.username,
        },
      }
    );

    const createBalanceLogData = {
      username: findSportsBetHistory.username,
      amount: winAmount,
      system_note: `SPORTS ${key}`,
      admin_id: "시스템",
      created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
      record_type: "베팅당첨",
      prev_balance: findSportsBetHistory.up_user.balance,
      after_balance: findSportsBetHistory.up_user.balance + amount,
    };

    await BalanceLogs.create(createBalanceLogData);

    console.log(`${findSportsBetHistory.key} 스포츠 배팅내역 결과처리 완료`);
  }

  return;
};
