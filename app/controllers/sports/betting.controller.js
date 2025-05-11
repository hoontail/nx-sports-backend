const db = require("../../models");
const Op = db.Sequelize.Op;
const Users = db.up_users;
const LevelConfigs = db.level_configs;
const SportsConfigs = db.sports_configs;
const SportsBonusOdds = db.sports_bonus_odds;
const SportsMatches = db.sports_matches;
const SportsOdds = db.sports_odds;
const SportsMarket = db.sports_market;
const SportsBetHistory = db.sports_bet_history;
const SportsBetDetail = db.sports_bet_detail;
const SportsCombine = db.sports_combine;
const BalanceLogs = db.balance_logs;
const KoscaLogs = db.kosca_logs;
const socketIO = require("socket.io-client");
const ioSocket = socketIO("http://localhost:3001");

const utils = require("../../utils");
const moment = require("moment");
const commaNumber = require("comma-number");

exports.bettingSports = async (req, res) => {
  try {
    const { gameType, amount, bettingArr } = req.body;
    const { username } = req;
    const bettingArrParse = JSON.parse(bettingArr);
    const key = utils.getUuidKey();
    const ip = utils.getIp(req);
    let minBetAmount;
    let maxBetAmount;
    let rollingPercentage = 0;
    let totalOdds = 1;

    if (
      !["크로스", "승무패", "핸디캡", "스페셜", "라이브"].includes(gameType)
    ) {
      return res.status(400).send({
        message: "잘못된 요청입니다",
      });
    }

    if (!bettingArr || bettingArrParse.length === 0) {
      return res.status(400).send({
        message: "배팅경기를 선택해주세요",
      });
    }

    if (!amount || amount === "" || amount <= 0) {
      return res.status(400).send({
        message: "배팅금액을 입력해주세요",
      });
    }

    const findUser = await Users.findOne({
      where: {
        username,
      },
    });

    const findLevelConfig = await LevelConfigs.findOne({
      where: {
        level: findUser.user_level,
      },
    });

    const findSportsConfig = await SportsConfigs.findOne();

    const isSingle = bettingArrParse.length === 1;
    const betType = isSingle ? "single" : "multi";
    const rollingType = findUser.rolling_point_type;
    let systemNote;
    if (rollingType === "LEVEL") {
      systemNote = `${key}-${rollingType}^${findUser.user_level}`;
      rollingPercentage =
        findLevelConfig[`sports_${betType}_rolling_percentage`];
    } else if (rollingType === "AGENT") {
      const findAgent = await findUser.findOne({
        where: {
          username: findUser.agent_username,
        },
      });

      if (findAgent) {
        systemNote = `${key}-${rollingType}^${findUser.agent_username}`;
        rollingPercentage = findAgent[`sports_${betType}_rolling_percentage`];
      }
    } else if (rollingType === "INDIVIDUAL") {
      systemNote = `${key}-${rollingType}`;
      rollingPercentage = findUser[`sports_${betType}_rolling_percentage`];
    }

    minBetAmount =
      findUser[`sports_${betType}_min_bet_amount`] ??
      findSportsConfig[`${betType}_min_bet_amount`];

    maxBetAmount =
      findUser[`sports_${betType}_max_bet_amount`] ??
      findSportsConfig[`${betType}_max_bet_amount`];

    if (minBetAmount > amount) {
      return res.status(400).send({
        message: `최소 배팅 금액은 ${commaNumber(minBetAmount)}원 입니다`,
      });
    }

    if (maxBetAmount < amount) {
      return res.status(400).send({
        message: `최대 배팅 금액은 ${commaNumber(maxBetAmount)}원 입니다`,
      });
    }

    if (findUser.balance < amount) {
      return res.status(400).send({
        message: "보유금액이 부족합니다",
      });
    }

    // 보너스 배당 체크
    const bonusOddsCount = bettingArrParse.filter(
      (x) => x.match.match_id === "보너스"
    ).length;

    if (bonusOddsCount > 1) {
      return res.status(400).send({
        message: "잘못된 요청입니다",
      });
    }

    const bonusOdds = bettingArrParse.find(
      (x) => x.match.match_id === "보너스"
    );
    let findSportsBonusOdds;
    if (bonusOdds) {
      findSportsBonusOdds = await SportsBonusOdds.findOne({
        where: {
          folder_count: bonusOdds.odds.odds_key,
        },
      });

      if (findSportsBonusOdds.status !== 1) {
        return res.status(400).send({
          message: "해당 보너스는 이용이 불가능합니다",
        });
      }

      if (
        bettingArrParse.length - bonusOddsCount <
        findSportsBonusOdds.folder_count
      ) {
        return res.status(400).send({
          message: `${findSportsBonusOdds.folder_count}폴 이상 조합시 보너스 이용이 가능합니다`,
        });
      }

      totalOdds = totalOdds * findSportsBonusOdds.odds;
    }

    const oddsKeyArr = [];
    bettingArrParse.forEach((x) => {
      if (x.match.match_id !== "보너스") oddsKeyArr.push(x.odds.odds_key);
    });

    const findSportsOdds = await SportsOdds.findAll({
      include: [
        {
          model: SportsMatches,
        },
        {
          model: SportsMarket,
        },
      ],
      where: {
        odds_key: oddsKeyArr,
      },
    });

    const createBetDetailData = [];

    if (
      findSportsOdds.length !==
      bettingArrParse.filter((x) => x.match.match_id !== "보너스").length
    ) {
      return res.status(400).send({
        message: "삭제된 배당은 배팅이 불가합니다",
      });
    }

    for (const odds of findSportsOdds) {
      const betType = bettingArrParse.find(
        (x) => x.odds.odds_key === odds.odds_key
      ).betType;

      if (odds.sports_match.is_delete) {
        return res.status(400).send({
          message: "삭제된 경기가 포함되어 있습니다",
        });
      }

      if (odds.is_market_stop || odds.is_odds_stop || odds.is_delete) {
        return res.status(400).send({
          message: "정지된 배당입니다",
        });
      }

      if (
        ["크로스", "승무패", "핸디캡"].includes(gameType) &&
        (moment
          .utc(odds.sports_match.start_datetime)
          .format("YYYY-MM-DD HH:mm:ss") <
          moment().format("YYYY-MM-DD HH:mm:ss") ||
          odds.sports_match.status_kr !== "경기전")
      ) {
        return res.status(400).send({
          message: "시작 전 경기만 배팅이 가능합니다",
        });
      }

      if (
        (gameType === "크로스" && !odds.sports_market.is_cross) ||
        (gameType === "승무패" && !odds.sports_market.is_winlose) ||
        (gameType === "핸디캡" && !odds.sports_market.is_handicap) ||
        (gameType === "라이브" && !odds.sports_market.is_inplay)
      ) {
        return res.status(400).send({
          message: "배팅이 불가능한 배당입니다",
        });
      }

      if (gameType === "스페셜") {
        const unablePeriodMap = {
          soccer: (x) =>
            x.status_kr === "경기중" ||
            moment.utc(x.start_datetime).format("YYYY-MM-DD HH:mm:ss") <=
              moment().format("YYYY-MM-DD HH:mm:ss")
              ? ["전반전", "연장제외", "연장포함"]
              : [],
          baseball: (x) => {
            const arr = [];
            const p = x.period_id;
            if (p >= 201)
              arr.push("1이닝", "5이닝합계", "연장제외", "연장포함");
            if (p >= 202) arr.push("2이닝");
            if (p >= 203) arr.push("3이닝");
            if (p >= 204) arr.push("4이닝");
            if (p >= 205) arr.push("5이닝");
            if (p >= 206) arr.push("6이닝");
            if (p >= 207) arr.push("7이닝");
            if (p >= 208) arr.push("8이닝");
            if (p >= 209) arr.push("9이닝");
            return arr;
          },
          icehockey: (x) => {
            const arr = [];
            const p = x.period_id;
            if (p >= 401) arr.push("1피리어드", "연장제외", "연장포함");
            if (p >= 402) arr.push("2피리어드");
            if (p >= 403) arr.push("3피리어드");
            return arr;
          },
          basketball: (x) => {
            const arr = [];
            const p = x.period_id;
            if (p >= 301) arr.push("1쿼터", "연장제외", "연장포함");
            if (p >= 302) arr.push("2쿼터");
            if (p >= 303 && p !== 305) arr.push("3쿼터");
            if (p >= 304) arr.push("4쿼터");
            return arr;
          },
          volleyball: (x) => {
            const arr = [];
            const p = x.period_id;
            if (p >= 501) arr.push("1세트", "연장제외", "연장포함");
            if (p >= 502) arr.push("2세트");
            if (p >= 503) arr.push("3세트");
            if (p >= 504) arr.push("4세트");
            if (p >= 505) arr.push("5세트");
            return arr;
          },
          esports: (x) => {
            const arr = [];
            if (
              x.status_kr !== "경기전" ||
              moment.utc(match.start_datetime).format("YYYY-MM-DD HH:mm:ss") <
                moment().format("YYYY-MM-DD HH:mm:ss")
            ) {
              arr.push(
                "1세트",
                "2세트",
                "3세트",
                "4세트",
                "5세트",
                "연장제외",
                "연장포함"
              );
            }
          },
        };

        const unablePeriodsFunc =
          unablePeriodMap[odds.sports_match.sports_name];

        if (unablePeriodsFunc) {
          const unablePeriods = unablePeriodsFunc(odds.sports_match);

          if (unablePeriods.includes(odds.sports_market.period)) {
            return res.status(400).send({
              message: "정지된 배당입니다",
            });
          }
        }
      }

      let selectedOdds;
      if (betType === 0) {
        selectedOdds = odds.away_odds;
      } else if (betType === 1) {
        selectedOdds = odds.home_odds;
      } else if (betType === 2) {
        selectedOdds = odds.draw_odds;
      } else {
        return res.status(400).send({
          message: "잘못된 요청입니다",
        });
      }

      if (findSportsBonusOdds && selectedOdds < findSportsBonusOdds.min_odds) {
        return res.status(400).send({
          message: findSportsBonusOdds.error_message,
        });
      }

      totalOdds = totalOdds * selectedOdds;

      const match = odds.sports_match;
      createBetDetailData.push({
        sports_bet_history_id: null,
        match_id: match.match_id,
        odds_key: odds.odds_key,
        market_id: odds.market_id,
        sports_name: match.sports_name,
        sports_name_kr: match.sports_name_kr,
        country: match.country,
        country_kr: match.country_kr,
        country_image: match.country_image,
        home_name: match.home_name,
        home_image: match.home_image,
        away_name: match.away_name,
        away_image: match.away_image,
        league_name: match.league_name,
        league_image: match.league_image,
        start_datetime: moment
          .utc(match.start_datetime)
          .format("YYYY-MM-DD HH:mm:ss"),
        home_odds: odds.home_odds,
        draw_odds: odds.draw_odds,
        away_odds: odds.away_odds,
        odds_line: odds.odds_line,
        odds: selectedOdds,
        bet_type: betType,
        league_id: match.league_id, // 조합 체크 때 필요
        market_type: odds.sports_market.type, // 조합 체크 때 필요
        period: odds.sports_market.period, // 조합 체크 때 필요
      });
    }

    if (
      createBetDetailData.length === 1 &&
      findSportsConfig.single_minus_odds > 0
    ) {
      totalOdds = totalOdds - findSportsConfig.single_minus_odds;

      if (totalOdds < 1) {
        totalOdds = 1;
      }
    } else if (
      createBetDetailData.length === 2 &&
      findSportsConfig.two_minus_odds > 0
    ) {
      totalOdds = totalOdds - findSportsConfig.two_minus_odds;

      if (totalOdds < 1) {
        totalOdds = 1;
      }
    }

    totalOdds = totalOdds.toFixed(2);

    // 조합 체크
    if (createBetDetailData.length > 1) {
      const isCombineValid = await checkCombine(gameType, createBetDetailData);

      if (!isCombineValid) {
        return res.status(400).send({
          message: "조합 불가능한 경기가 있습니다",
        });
      }
    }

    await db.sequelize.transaction(async (t) => {
      // -보유머니 + 총배팅
      await Users.decrement(
        {
          balance: amount,
          bet_total: -amount,
        },
        {
          where: {
            username: findUser.username,
          },
          transaction: t,
        }
      );

      // 배팅 내역
      const createBetHistoryData = {
        username: findUser.username,
        key,
        game_type: gameType,
        bet_amount: amount,
        total_odds: totalOdds,
        bonus_odds: findSportsBonusOdds ? findSportsBonusOdds.odds : null,
        prev_balance: findUser.balance,
        after_balance: findUser.balance - amount,
        created_ip: ip,
      };

      const createBetHistory = await SportsBetHistory.create(
        createBetHistoryData,
        {
          transaction: t,
        }
      );

      // 배팅 내역 상세
      createBetDetailData.forEach((x) => {
        x.sports_bet_history_id = createBetHistory.id;
      });

      await SportsBetDetail.bulkCreate(createBetDetailData, {
        transaction: t,
      });

      // 배팅 머니로그
      const createBalanceLogData = {
        username: findUser.username,
        amount,
        system_note: `KSPORTS ${key}`,
        admin_id: "시스템",
        created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        record_type: "베팅",
        prev_balance: findUser.balance,
        after_balance: findUser.balance - amount,
      };

      await BalanceLogs.create(createBalanceLogData, {
        transaction: t,
      });

      // 롤링
      if (rollingPercentage > 0) {
        const rollingAmount = amount * rollingPercentage;

        if (rollingAmount > 0) {
          const createKoscaLogData = {
            user_id: findUser.username,
            username: findUser.username,
            game_id: "ksports",
            amount,
            transaction_id: key,
            created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            status: 1,
            rolling_point: rollingAmount,
            rolling_point_percentage: rollingPercentage,
            game_category: "sports",
            bet_date: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            save_log_date: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            is_live: gameType === "라이브" ? 1 : 0,
            odds_total: totalOdds,
            expected_amount: Math.floor(amount * totalOdds),
          };

          await KoscaLogs.create(createKoscaLogData, {
            transaction: t,
          });
        }
      }
    });

    if (amount >= findSportsConfig.alert_bet_amount) {
      ioSocket.emit(
        "sportsBettingAlert",
        `${findUser.username}[${
          findUser.user_real_name
        }] - 스포츠 베팅 ${commaNumber(amount)}원`
      );
    }

    return res.status(200).send({
      message: "배팅이 완료되었습니다",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

const checkCombine = async (gameType, bettingArr) => {
  const findSportsCombine = await SportsCombine.findAll({
    where: { status: 1 },
  });
  let isValid = true;

  outer: for (const combine of findSportsCombine) {
    if (combine.game_type !== gameType) continue;

    for (const odds of bettingArr) {
      let othersBase = bettingArr.filter((x) => x.odds_key !== odds.odds_key);

      if (
        combine.sports_name !== "전체" &&
        combine.sports_name !== odds.sports_name
      ) {
        continue;
      }

      const pass1 =
        (combine.market_type_1 === "전체" ||
          combine.market_type_1 === odds.market_type) &&
        (combine.bet_type_1 === "전체" ||
          combine.bet_type_1 == odds.bet_type) &&
        (combine.period_type_1 === "전체" ||
          combine.period_type_1 === odds.period);
      if (!pass1) continue;

      if (combine.league_type === "동일리그") {
        othersBase = othersBase.filter((o) => o.league_id === odds.league_id);
      }
      if (combine.match_type === "동일경기") {
        othersBase = othersBase.filter((o) => o.match_id === odds.match_id);
      }

      const foundSecond = othersBase.some(
        (o) =>
          (combine.market_type_2 === "전체" ||
            combine.market_type_2 === o.market_type) &&
          (combine.bet_type_2 === "전체" || combine.bet_type_2 == o.bet_type) &&
          (combine.period_type_2 === "전체" ||
            combine.period_type_2 === o.period)
      );

      if (foundSecond) {
        isValid = false;
        break outer;
      }
    }
  }

  return isValid;
};

exports.cancelBetHistoryForUser = async (req, res) => {
  const { key } = req.body;
  const ip = utils.getIp(req);

  try {
    const findHistory = await SportsBetHistory.findOne({
      include: [
        {
          model: Users,
        },
        {
          model: SportsBetDetail,
        },
      ],
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

    if (findHistory.status !== 0) {
      return res.status(400).send({
        message: "이미 처리된 베팅내역입니다",
      });
    }

    const findSportsConfig = await SportsConfigs.findOne();

    const findCanceledHistoryCount = await SportsBetHistory.count({
      where: {
        username: req.username,
        status: 4,
        canceled_at: {
          [Op.between]: [
            moment().format("YYYY-MM-DD 00:00:00"),
            moment().format("YYYY-MM-DD 23:59:59"),
          ],
        },
      },
    });

    if (findCanceledHistoryCount >= findSportsConfig.cancel_daily_count) {
      return res.status(400).send({
        message: `베팅취소는 하루 최대 ${findSportsConfig.cancel_daily_count}번입니다`,
      });
    }

    if (
      moment.utc(findHistory.created_at).format("YYYY-MM-DD HH:mm:ss") <
      moment()
        .subtract(findSportsConfig.cancel_after_bet_time, "minutes")
        .format("YYYY-MM-DD HH:mm:ss")
    ) {
      return res.status(400).send({
        message: `베팅 ${findSportsConfig.cancel_after_bet_time}분 이후는 취소가 불가능합니다`,
      });
    }

    for (const detail of findHistory.sports_bet_details) {
      if (
        moment
          .utc(detail.start_datetime)
          .subtract(findSportsConfig.cancel_before_start_time, "minutes")
          .format("YYYY-MM-DD HH:mm:ss") <
        moment().format("YYYY-MM-DD HH:mm:ss")
      ) {
        return res.status(400).send({
          message: `경기시작 ${findSportsConfig.cancel_before_start_time}분 전까지만 취소가 가능합니다`,
        });
      }

      if (
        moment.utc(detail.start_datetime).format("YYYY-MM-DD HH:mm:ss") <
        moment().format("YYYY-MM-DD HH:mm:ss")
      ) {
        return res.status(400).send({
          message: "이미 시직된 경기는 취소가 불가능합니다",
        });
      }
    }

    await db.sequelize.transaction(async (t) => {
      await SportsBetHistory.update(
        {
          status: 4,
          win_amount: findHistory.bet_amount,
          canceled_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          canceled_ip: ip,
        },
        {
          where: {
            key,
          },
          transaction: t,
        }
      );

      await Users.increment(
        {
          balance: findHistory.bet_amount,
          bet_total: -findHistory.bet_amount,
        },
        {
          where: {
            username: req.username,
          },
          transaction: t,
        }
      );

      // 배팅취소 머니로그
      const createBalanceLogData = {
        username: findHistory.username,
        amount: findHistory.bet_amount,
        system_note: `KSPORTS ${key}`,
        admin_id: "시스템",
        created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        record_type: "베팅취소",
        prev_balance: findHistory.up_user.balance,
        after_balance: findHistory.up_user.balance + findHistory.bet_amount,
      };

      await BalanceLogs.create(createBalanceLogData, {
        transaction: t,
      });

      // 롤링로그 체크
      const findKoscaLogs = await KoscaLogs.findOne({
        where: {
          username: req.username,
          transaction_id: key,
          game_id: "ksports",
          status: 1,
        },
        transaction: t,
      });

      if (findKoscaLogs) {
        await KoscaLogs.update(
          {
            status: 3,
            bet_result: findHistory.bet_amount,
            net_loss: 0,
            updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
          },
          {
            where: {
              id: findKoscaLogs.id,
            },
            transaction: t,
          }
        );
      }
    });

    return res.status(200).send({
      message: "베팅이 취소되었습니다",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.checkCancelBettingHistoryForUser = async (req, res) => {
  try {
    const findSportsConfig = await SportsConfigs.findOne();

    const findCanceledHistoryCount = await SportsBetHistory.count({
      where: {
        username: req.username,
        status: 4,
        canceled_at: {
          [Op.between]: [
            moment().format("YYYY-MM-DD 00:00:00"),
            moment().format("YYYY-MM-DD 23:59:59"),
          ],
        },
      },
    });

    return res.status(200).send({
      message: findSportsConfig.cancel_message.replace(
        "{count}",
        findSportsConfig.cancel_daily_count - findCanceledHistoryCount
      ),
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
