exports.getSportsResult = (sports, odds, score) => {
  let result;

  switch (sports) {
    case "soccer":
      result = this.soccerResult(odds, score);
      break;
    case "baseball":
      result = this.baseballResult(odds, score);
      break;
    case "icehockey":
      result = this.icehockeyResult(odds, score);
      break;
    case "basketball":
      result = this.basketballResult(odds, score);
      break;
    case "volleyball":
      result = this.volleyballResult(odds, score);
      break;
    case "tabletennis":
      result = this.tabletennisResult(odds, score);
      break;
    case "tennis":
      result = this.tennisResult(odds, score);
      break;
    case "americanfootball":
      result = this.americanfootballResult(odds, score);
      break;
    case "boxingufc":
      result = this.boxingResult(odds, score);
      break;
    case "esports":
      result = this.esportsResult(odds, score);
      break;
  }

  return result;
};

exports.soccerResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  const marketType = odds.sports_market.type;
  const marketPeriod = odds.sports_market.period;
  const oddsLine = parseFloat(odds.odds_line);

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

  return {
    result,
    score: `${homeScore}:${awayScore}`,
  };
};

exports.baseballResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  const marketType = odds.sports_market.type;
  const marketPeriod = odds.sports_market.period;
  const oddsLine = parseFloat(odds.odds_line);

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

  return {
    result,
    score: `${homeScore}:${awayScore}`,
  };
};

exports.icehockeyResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  const marketType = odds.sports_market.type;
  const marketPeriod = odds.sports_market.period;
  const oddsLine = parseFloat(odds.odds_line);

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

  return {
    result,
    score: `${homeScore}:${awayScore}`,
  };
};

exports.basketballResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  const marketType = odds.sports_market.type;
  const marketPeriod = odds.sports_market.period;
  const oddsLine = parseFloat(odds.odds_line);

  if (marketPeriod === "연장포함") {
    homeScore = parseInt(resultJson.home.score);
    awayScore = parseInt(resultJson.away.score);
  } else if (marketType === "전반전") {
    homeScore = parseInt(resultJson.home["1"]) + parseInt(resultJson.home["2"]);
    awayScore = parseInt(resultJson.away["1"]) + parseInt(resultJson.away["2"]);
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

  return {
    result,
    score: `${homeScore}:${awayScore}`,
  };
};

exports.volleyballResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore =
    parseInt(resultJson.home["1"] ?? "0") +
    parseInt(resultJson.home["2"] ?? "0") +
    parseInt(resultJson.home["3"] ?? "0") +
    parseInt(resultJson.home["4"] ?? "0") +
    parseInt(resultJson.home["5"] ?? "0");
  let awayScore =
    parseInt(resultJson.away["1"] ?? "0") +
    parseInt(resultJson.away["2"] ?? "0") +
    parseInt(resultJson.away["3"] ?? "0") +
    parseInt(resultJson.away["4"] ?? "0") +
    parseInt(resultJson.away["5"] ?? "0");
  let homeSetScore =
    parseInt(resultJson.home["1_set"] ?? "0") +
    parseInt(resultJson.home["2_set"] ?? "0") +
    parseInt(resultJson.home["3_set"] ?? "0") +
    parseInt(resultJson.home["4_set"] ?? "0") +
    parseInt(resultJson.home["5_set"] ?? "0");
  let awaySetScore =
    parseInt(resultJson.away["1_set"] ?? "0") +
    parseInt(resultJson.away["2_set"] ?? "0") +
    parseInt(resultJson.away["3_set"] ?? "0") +
    parseInt(resultJson.away["4_set"] ?? "0") +
    parseInt(resultJson.away["5_set"] ?? "0");

  const marketType = odds.sports_market.type;
  const marketPeriod = odds.sports_market.period;
  const marketId = odds.market_id;
  const oddsLine = parseFloat(odds.odds_line);

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

  return {
    result,
    score:
      marketType === "승패" || marketType === "승무패" || marketId === 18002
        ? `${homeSetScore}:${awaySetScore}`
        : `${homeScore}:${awayScore}`,
  };
};

exports.tabletennisResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore =
    parseInt(resultJson.home["1_set"] ?? "0") +
    parseInt(resultJson.home["2_set"] ?? "0") +
    parseInt(resultJson.home["3_set"] ?? "0") +
    parseInt(resultJson.home["4_set"] ?? "0") +
    parseInt(resultJson.home["5_set"] ?? "0") +
    parseInt(resultJson.home["6_set"] ?? "0") +
    parseInt(resultJson.home["7_set"] ?? "0");
  let awayScore =
    parseInt(resultJson.away["1_set"] ?? "0") +
    parseInt(resultJson.away["2_set"] ?? "0") +
    parseInt(resultJson.away["3_set"] ?? "0") +
    parseInt(resultJson.away["4_set"] ?? "0") +
    parseInt(resultJson.away["5_set"] ?? "0") +
    parseInt(resultJson.away["6_set"] ?? "0") +
    parseInt(resultJson.away["7_set"] ?? "0");

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

  return {
    result,
    score: `${homeScore}:${awayScore}`,
  };
};

exports.tennisResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore =
    parseInt(resultJson.home["1"] ?? "0") +
    parseInt(resultJson.home["2"] ?? "0") +
    parseInt(resultJson.home["3"] ?? "0") +
    parseInt(resultJson.home["4"] ?? "0") +
    parseInt(resultJson.home["5"] ?? "0");
  let awayScore =
    parseInt(resultJson.away["1"] ?? "0") +
    parseInt(resultJson.away["2"] ?? "0") +
    parseInt(resultJson.away["3"] ?? "0") +
    parseInt(resultJson.away["4"] ?? "0") +
    parseInt(resultJson.away["5"] ?? "0");

  let homeSetScore =
    parseInt(resultJson.home["1_set"] ?? "0") +
    parseInt(resultJson.home["2_set"] ?? "0") +
    parseInt(resultJson.home["3_set"] ?? "0") +
    parseInt(resultJson.home["4_set"] ?? "0") +
    parseInt(resultJson.home["5_set"] ?? "0");
  let awaySetScore =
    parseInt(resultJson.away["1_set"] ?? "0") +
    parseInt(resultJson.away["2_set"] ?? "0") +
    parseInt(resultJson.away["3_set"] ?? "0") +
    parseInt(resultJson.away["4_set"] ?? "0") +
    parseInt(resultJson.away["5_set"] ?? "0");

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
    if (homeSetScore > awaySetScore) {
      result = 1;
    } else if (homeSetScore < awaySetScore) {
      result = 0;
    } else if (homeSetScore === awaySetScore) {
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

  return {
    result,
    score:
      marketType === "승패"
        ? `${homeSetScore}:${awaySetScore}`
        : `${homeScore}:${awayScore}`,
  };
};

exports.americanfootballResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.ft);
  let awayScore = parseInt(resultJson.away.ft);

  const marketType = odds.sports_market.type;
  const marketPeriod = odds.sports_market.period;
  const oddsLine = parseFloat(odds.odds_line);

  if (marketPeriod === "연장포함") {
    homeScore = parseInt(resultJson.home.score);
    awayScore = parseInt(resultJson.away.score);
  } else if (marketPeriod === "1쿼터") {
    homeScore = parseInt(resultJson.home["1"]);
    awayScore = parseInt(resultJson.away["1"]);
  } else if (marketPeriod === "전반전") {
    homeScore = parseInt(resultJson.home["1"]) + parseInt(resultJson.home["2"]);
    awayScore = parseInt(resultJson.away["1"]) + parseInt(resultJson.away["2"]);
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

  return {
    result,
    score: `${homeScore}:${awayScore}`,
  };
};

exports.boxingResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;

  let homeScore = parseInt(resultJson.home.score);
  let awayScore = parseInt(resultJson.away.score);

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

  return {
    result,
    score: `${homeScore}:${awayScore}`,
  };
};

exports.esportsResult = (odds, score) => {
  const resultJson = JSON.parse(score);

  // 0: 패, 1: 승, 2: 무
  let result;
  let homeScore = parseInt(resultJson.home.score);
  let awayScore = parseInt(resultJson.away.score);

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
  } else if (
    marketPeriod === "2세트" &&
    (marketType === "킬 합계" || marketType === "킬 핸디캡")
  ) {
    homeScore = parseInt(resultJson.home["k2"]);
    awayScore = parseInt(resultJson.away["k2"]);
  } else if (marketPeriod === "3세트" && marketType === "승패") {
    homeScore = parseInt(resultJson.home["3"]);
    awayScore = parseInt(resultJson.away["3"]);
  } else if (
    marketPeriod === "3세트" &&
    (marketType === "킬 합계" || marketType === "킬 핸디캡")
  ) {
    homeScore = parseInt(resultJson.home["k3"]);
    awayScore = parseInt(resultJson.away["k3"]);
  } else if (marketPeriod === "4세트" && marketType === "승패") {
    homeScore = parseInt(resultJson.home["4"]);
    awayScore = parseInt(resultJson.away["4"]);
  } else if (
    marketPeriod === "4세트" &&
    (marketType === "킬 합계" || marketType === "킬 핸디캡")
  ) {
    homeScore = parseInt(resultJson.home["k4"]);
    awayScore = parseInt(resultJson.away["k4"]);
  } else if (marketPeriod === "5세트" && marketType === "승패") {
    homeScore = parseInt(resultJson.home["5"]);
    awayScore = parseInt(resultJson.away["5"]);
  } else if (
    marketPeriod === "5세트" &&
    (marketType === "킬 합계" || marketType === "킬 핸디캡")
  ) {
    homeScore = parseInt(resultJson.home["k5"]);
    awayScore = parseInt(resultJson.away["k5"]);
  }

  if (
    ["승패", "첫용", "첫바론", "첫타워", "첫킬", "킬 합계"].includes(marketType)
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

  return {
    result,
    score: `${homeScore}:${awayScore}`,
  };
};
