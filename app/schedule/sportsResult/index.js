const db = require("../../models");
const Users = db.up_users;
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsMarket = db.sports_market;
const SportsBetHistory = db.sports_bet_history;
const SportsBetDetail = db.sports_bet_detail;
const SportsConfigs = db.sports_configs;
const BalanceLogs = db.balance_logs;
const KoscaLogs = db.kosca_logs;

const moment = require("moment");
const {
  soccerResult,
  baseballResult,
  icehockeyResult,
  basketballResult,
  volleyballResult,
  tabletennisResult,
  tennisResult,
  americanfootballResult,
  boxingResult,
  esportsResult,
} = require("../../helpers/sportsResult");

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
        status_id: [3, 4, 5, 6, 9, 10, 99],
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
  for await (const odds of match.sports_odds) {
    const marketPeriod = odds.sports_market.period;

    if (match.period_id < 102 && marketPeriod === "전반전") continue;

    if (match.status_kr !== "경기종료" && marketPeriod === "후반전") continue;

    if (
      match.status_kr !== "경기종료" &&
      (marketPeriod === "연장포함" || marketPeriod === "연장제외")
    )
      continue;

    const getResult = soccerResult(odds, match.score);

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 야구 결과처리
const baseballResultProcess = async (match) => {
  for await (const odds of match.sports_odds) {
    const marketPeriod = odds.sports_market.period;
    const marketType = odds.sports_market.type;

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

    // - 5회 말 3아웃을 채우지 못할 경우 : 승패 핸디캡 언더오버 모두 적중특례 처리
    // - 5회 말 3아웃을 채울 경우 : 승패 = 정상 마감 / 핸디캡 언더오버 적중특례 처리

    let getResult = {
      result: "",
      score: "",
    };

    if (match.status_kr === "경기종료" && match.period_id <= 205) {
      getResult.result = 2;
    } else if (
      match.status_kr === "경기종료" &&
      match.period_id >= 206 &&
      match.period_id <= 208 &&
      (marketType === "언더오버" || marketType === "핸디캡")
    ) {
      getResult.result = 2;
    } else {
      getResult = baseballResult(odds, match.score);
    }

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 아이스하키 결과처리
const icehockeyResultProcess = async (match) => {
  for await (const odds of match.sports_odds) {
    const marketPeriod = odds.sports_market.period;

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

    const getResult = icehockeyResult(odds, match.score);

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 농구 결과처리
const basketballResultProcess = async (match) => {
  for await (const odds of match.sports_odds) {
    const marketPeriod = odds.sports_market.period;

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

    const getResult = basketballResult(odds, match.score);

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 배구 결과처리
const volleyballResultProcess = async (match) => {
  for await (const odds of match.sports_odds) {
    const marketPeriod = odds.sports_market.period;

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

    const getResult = volleyballResult(odds, match.score);

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 탁구 결과처리
const tabletennisResultProcess = async (match) => {
  for await (const odds of match.sports_odds) {
    const getResult = tabletennisResult(odds, match.score);

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 테니스 결과처리
const tennisResultProcess = async (match) => {
  for await (const odds of match.sports_odds) {
    const getResult = tennisResult(odds, match.score);

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 미식축구 결과처리
const americanfootballResultProcess = async (match) => {
  for await (const odds of match.sports_odds) {
    const marketPeriod = odds.sports_market.period;

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

    const getResult = americanfootballResult(odds, match.score);

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 복싱 결과처리
const boxingResultProcess = async (match) => {
  for await (const odds of match.sports_odds) {
    const getResult = boxingResult(odds, match.score);

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 이스포츠 결과처리
const esportsResultProcess = async (match) => {
  for await (const odds of match.sports_odds) {
    const getResult = esportsResult(odds, match.score);

    // 배당 결과값 수정
    await this.updateOddsResult(odds, getResult);
  }

  // 경기 결과처리 수정
  await updateMatchResult(match);
};

// 배당 결과값 수정
exports.updateOddsResult = async (odds, getResult) => {
  await SportsOdds.update(
    {
      result: getResult.result,
      score: getResult.score,
    },
    {
      where: {
        odds_key: odds.odds_key,
      },
    }
  );

  await betDetailResultProcess(odds, getResult);
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
const betDetailResultProcess = async (odds, getResult) => {
  const findSportsBetDetail = await SportsBetDetail.findAll({
    include: {
      model: SportsMarket,
    },
    where: {
      odds_key: odds.odds_key,
      status: 0,
    },
  });

  const result = getResult.result;
  const score = getResult.score;

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
          score: score,
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
        model: Users,
      },
    ],
    where: {
      id: historyId,
      status: 0,
    },
  });

  if (findSportsBetDetail.length === 0 || !findSportsBetHistory) return;

  const findSportsConfig = await SportsConfigs.findOne();

  const findKoscaLogs = await KoscaLogs.findOne({
    where: {
      transaction_id: findSportsBetHistory.key,
    },
  });

  // 낙첨처리
  if (findSportsBetDetail.some((x) => x.status === 2)) {
    await SportsBetHistory.update(
      {
        status: 2,
        win_amount: 0,
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
    if (findSportsConfig.lose_point_percentage > 0) {
      const losingPoint =
        findSportsBetHistory.bet_amount *
        findSportsConfig.lose_point_percentage;

      if (losingPoint > 0) {
        const createKoscaLogData = {
          user_id: findSportsBetHistory.username,
          username: findSportsBetHistory.username,
          game_id: "ksports",
          amount: findSportsBetHistory.bet_amount,
          transaction_id: findSportsBetHistory.key,
          created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          status: 2,
          bet_result: 0,
          rolling_point: losingPoint,
          rolling_point_percentage: findSportsConfig.lose_point_percentage,
          game_category: "sports",
          net_loss: findSportsBetHistory.bet_amount,
          bet_date: moment
            .utc(findSportsBetHistory.created_at)
            .format("YYYY-MM-DD HH:mm:ss"),
          save_log_date: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          is_live: findSportsBetHistory.game_type === "라이브" ? 1 : 0,
          odds_total: findSportsBetHistory.total_odds,
          expected_amount: Math.floor(
            findSportsBetHistory.bet_amount * findSportsBetHistory.total_odds
          ),
        };

        await KoscaLogs.create(createKoscaLogData);
      }
    }

    // 롤링 로그 업데이트
    if (findKoscaLogs) {
      await KoscaLogs.update(
        {
          status: 2,
          bet_result: 0,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          net_loss: findSportsBetHistory.bet_amount,
        },
        {
          where: {
            transaction_id: findKoscaLogs.transaction_id,
          },
        }
      );
    }

    return console.log(
      `${findSportsBetHistory.key} 스포츠 배팅내역 결과처리 완료`
    );
  }

  let totalOdds = 1;
  let betType;

  if (findSportsBetDetail.length === 1) {
    betType = "single";
  } else if (findSportsBetDetail.length > 1) {
    betType = "multi";
  }

  // 취소처리
  if (
    findSportsBetDetail.length ===
    findSportsBetDetail.filter((x) => x.status === 3).length
  ) {
    const winAmount = findSportsBetHistory.bet_amount;
    await SportsBetHistory.update(
      {
        win_amount: winAmount,
        status: 3,
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
      system_note: `KSPORTS ${findSportsBetHistory.key}`,
      admin_id: "시스템",
      created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
      record_type: "베팅취소",
      prev_balance: findSportsBetHistory.up_user.balance,
      after_balance: findSportsBetHistory.up_user.balance + winAmount,
    };

    await BalanceLogs.create(createBalanceLogData);

    // 롤링 로그 업데이트
    if (findKoscaLogs) {
      await KoscaLogs.update(
        {
          status: 3,
          bet_result: winAmount,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          net_loss: findSportsBetHistory.bet_amount - winAmount,
        },
        {
          where: {
            transaction_id: findKoscaLogs.transaction_id,
          },
        }
      );
    }

    return console.log(
      `${findSportsBetHistory.key} 스포츠 배팅내역 결과처리 완료`
    );
  }

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

    if (betType === "single" && findSportsConfig.single_minus_odds > 0) {
      totalOdds -= findSportsConfig.single_minus_odds;

      if (totalOdds < 1) {
        totalOdds = 1;
      }
    } else if (
      findSportsBetDetail.length === 2 &&
      findSportsConfig.two_minus_odds > 0
    ) {
      totalOdds -= findSportsConfig.two_minus_odds;

      if (totalOdds < 1) {
        totalOdds = 1;
      }
    }

    const maxWinOdds = findSportsConfig[`${betType}_max_win_odds`];

    totalOdds = parseFloat(totalOdds.toFixed(2));

    if (totalOdds > maxWinOdds) {
      totalOdds = parseFloat(maxWinOdds.toFixed(2));
    }

    let winAmount = Math.floor(findSportsBetHistory.bet_amount * totalOdds);
    const maxWinAmount =
      findSportsBetHistory.up_user[`sports_${betType}_max_win_amount`] ??
      findSportsConfig[`${betType}_max_win_amount`];

    if (winAmount > maxWinAmount) {
      winAmount = maxWinAmount;
    }

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
      system_note: `KSPORTS ${findSportsBetHistory.key}`,
      admin_id: "시스템",
      created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
      record_type: "베팅당첨",
      prev_balance: findSportsBetHistory.up_user.balance,
      after_balance: findSportsBetHistory.up_user.balance + winAmount,
    };

    await BalanceLogs.create(createBalanceLogData);

    // 롤링 로그 업데이트
    if (findKoscaLogs) {
      await KoscaLogs.update(
        {
          status: 2,
          bet_result: winAmount,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          net_loss: findSportsBetHistory.bet_amount - winAmount,
        },
        {
          where: {
            transaction_id: findKoscaLogs.transaction_id,
          },
        }
      );
    }

    console.log(`${findSportsBetHistory.key} 스포츠 배팅내역 결과처리 완료`);
  }

  return;
};
