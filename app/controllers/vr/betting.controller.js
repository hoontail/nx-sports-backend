const db = require("../../models");
const Users = db.up_users;
const BalanceLogs = db.balance_logs;
const VrConfigs = db.vr_configs;
const VrBonusOdds = db.vr_bonus_odds;
const VrMarket = db.vr_market;
const VrCombine = db.vr_combine;
const VrOdds = db.vr_odds;
const VrSportsConfigs = db.vr_sports_configs;
const VrBetHistory = db.vr_bet_history;
const VrBetDetail = db.vr_bet_detail;

const utils = require("../../utils");
const moment = require("moment");
const commaNumber = require("comma-number");

exports.bettingVr = async (req, res) => {
  try {
    const { amount, bettingArr } = req.body;
    const { username } = req;
    const bettingArrParse = JSON.parse(bettingArr);
    const key = utils.getUuidKey();
    const ip = utils.getIp(req);
    let minBetAmount;
    let maxBetAmount;
    let maxWinOdds;
    let totalOdds = 1;

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

    const findVrConfig = await VrConfigs.findOne();

    const isSingle = bettingArrParse.length === 1;
    const betType = isSingle ? "single" : "multi";

    minBetAmount =
      findUser[`vr_${betType}_min_bet_amount`] ??
      findVrConfig[`${betType}_min_bet_amount`];

    maxBetAmount =
      findUser[`vr_${betType}_max_bet_amount`] ??
      findVrConfig[`${betType}_max_bet_amount`];

    maxWinOdds = findVrConfig[`${betType}_max_win_odds`].toFixed(2);

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
      (x) => x.odds.match_id === "보너스"
    ).length;

    if (bonusOddsCount > 1) {
      return res.status(400).send({
        message: "잘못된 요청입니다",
      });
    }

    const bonusOdds = bettingArrParse.find((x) => x.odds.match_id === "보너스");
    let findVrBonusOdds;
    if (bonusOdds) {
      findVrBonusOdds = await VrBonusOdds.findOne({
        where: {
          folder_count: bonusOdds.odds.odds_key,
        },
      });

      if (findVrBonusOdds.status !== 1) {
        return res.status(400).send({
          message: "해당 보너스는 이용이 불가능합니다",
        });
      }

      if (
        bettingArrParse.length - bonusOddsCount <
        findVrBonusOdds.folder_count
      ) {
        return res.status(400).send({
          message: `${findVrBonusOdds.folder_count}폴 이상 조합시 보너스 이용이 가능합니다`,
        });
      }

      totalOdds = totalOdds * findVrBonusOdds.odds;
    }

    const oddsKeyArr = [];
    bettingArrParse.forEach((x) => {
      if (x.odds.match_id !== "보너스") oddsKeyArr.push(x.odds.odds_key);
    });

    const findVrOdds = await VrOdds.findAll({
      include: [
        {
          model: VrMarket,
        },
        {
          model: VrSportsConfigs,
        },
      ],
      where: {
        odds_key: oddsKeyArr,
      },
    });

    const createBetDetailData = [];

    if (
      findVrOdds.length !==
      bettingArrParse.filter((x) => x.odds.match_id !== "보너스").length
    ) {
      return res.status(400).send({
        message: "삭제된 배당은 배팅이 불가합니다",
      });
    }

    const findVrSportsConfig = await VrSportsConfigs.findOne({
      where: {
        id: findVrOdds[0].vr_sports_configs_id,
      },
    });

    if (!findVrSportsConfig.status) {
      return res.status(400).send({
        message: findVrSportsConfig.close_message,
      });
    }

    for (const odds of findVrOdds) {
      const betType = bettingArrParse.find(
        (x) => x.odds.odds_key === odds.odds_key
      ).betType;

      if (
        moment
          .utc(odds.start_datetime)
          .subtract(findVrSportsConfig.close_time, "seconds")
          .format("YYYY-MM-DD HH:mm:ss") <
          moment().format("YYYY-MM-DD HH:mm:ss") ||
        odds.status !== "경기전"
      ) {
        return res.status(400).send({
          message: "배팅이 마감되었습니다",
        });
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

      if (findVrBonusOdds && selectedOdds < findVrBonusOdds.min_odds) {
        return res.status(400).send({
          message: findVrBonusOdds.error_message,
        });
      }

      totalOdds = totalOdds * selectedOdds;

      createBetDetailData.push({
        vr_bet_history_id: null,
        odds_key: odds.odds_key,
        vr_sports_configs_id: odds.vr_sports_configs_id,
        league_name: odds.league_name,
        vr_market_id: odds.vr_market_id,
        market_type: odds.market_type,
        home_name: odds.home_name,
        home_image: odds.home_image,
        away_name: odds.away_name,
        away_image: odds.away_image,
        home_odds: odds.home_odds,
        draw_odds: odds.draw_odds,
        away_odds: odds.away_odds,
        start_datetime: moment
          .utc(odds.start_datetime)
          .format("YYYY-MM-DD HH:mm:ss"),
        odds: selectedOdds,
        bet_type: betType,
        match_id: odds.match_id, // 조합 체크 때 필요
        vr_market: odds.vr_market, // 조합 체크 때 필요
        sports_name: odds.vr_sports_config.sports_name, // 조합 체크 때 필요
      });
    }

    totalOdds = totalOdds.toFixed(2);

    if (Number(totalOdds) > Number(maxWinOdds)) {
      return res.status(400).send({
        message: `최대 당첨 배당은 ${maxWinOdds}배 입니다`,
      });
      // totalOdds = maxWinOdds;
    }

    // 조합 체크
    if (createBetDetailData.length > 1) {
      const isCombineValid = await checkCombine(createBetDetailData);

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
        bet_amount: amount,
        total_odds: totalOdds,
        bonus_odds: findVrBonusOdds ? findVrBonusOdds.odds : null,
        prev_balance: findUser.balance,
        after_balance: findUser.balance - amount,
        created_ip: ip,
      };

      const createBetHistory = await VrBetHistory.create(createBetHistoryData, {
        transaction: t,
      });

      // 배팅 내역 상세
      createBetDetailData.forEach((x) => {
        x.vr_bet_history_id = createBetHistory.id;
      });

      await VrBetDetail.bulkCreate(createBetDetailData, {
        transaction: t,
      });

      // 배팅 머니로그
      const createBalanceLogData = {
        username: findUser.username,
        amount: -amount,
        system_note: `VR ${key}`,
        admin_id: "시스템",
        created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        record_type: "베팅",
        prev_balance: findUser.balance,
        after_balance: findUser.balance - amount,
        game_id: 'vr',
        game_category: 'minigame'
      };

      await BalanceLogs.create(createBalanceLogData, {
        transaction: t,
      });
    });

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

const checkCombine = async (bettingArr) => {
  const findVrCombine = await VrCombine.findAll({
    where: { status: 1 },
  });
  let isValid = true;

  outer: for (const combine of findVrCombine) {
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
          combine.market_type_1 === odds.vr_market.type) &&
        (combine.bet_type_1 === "전체" || combine.bet_type_1 == odds.bet_type);
      if (!pass1) continue;

      if (combine.match_type === "동일경기") {
        othersBase = othersBase.filter((o) => o.match_id === odds.match_id);
      }

      const foundSecond = othersBase.some(
        (o) =>
          (combine.market_type_2 === "전체" ||
            combine.market_type_2 === o.vr_market.type) &&
          (combine.bet_type_2 === "전체" || combine.bet_type_2 == o.bet_type)
      );

      if (foundSecond) {
        isValid = false;
        break outer;
      }
    }
  }

  return isValid;
};
