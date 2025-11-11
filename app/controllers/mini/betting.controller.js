const db = require("../../models");
const Op = db.Sequelize.Op;
const MiniGames = db.mini_games;
const MiniConfigs = db.mini_configs;
const MiniBetType = db.mini_bet_type;
const MiniBetHistory = db.mini_bet_history;
const Users = db.up_users;
const BalanceLogs = db.balance_logs;

const utils = require("../../utils");
const moment = require("moment");
const commaNumber = require("comma-number");

exports.bettingForUser = async (req, res) => {
  const { game, minute, date, round, type, amount } = req.body;
  const key = utils.getUuidKey();
  const ip = utils.getIp(req);
  let minBetAmount = 0;
  let maxBetAmount = 0;

  try {
    if (!game || !minute) {
      return res.status(400).send({
        message: "잘못된 요청입니다",
      });
    }

    if (!type) {
      return res.status(400).send({
        message: "베팅을 선택해주세요",
      });
    }

    if (!amount || amount === "" || amount <= 0) {
      return res.status(400).send({
        message: "배팅 금액을 입력해주세요",
      });
    }

    const findGame = await MiniGames.findOne({
      where: {
        game,
        minute,
        date,
        date_round: round,
      },
    });

    if (!findGame) {
      return res.status(400).send({
        message: "잘못된 요청입니다",
      });
    }

    const findUser = await Users.findOne({
      where: {
        username: req.username,
      },
    });

    const findMiniConfigs = await MiniConfigs.findOne();

    if (findMiniConfigs[`${game}_${minute}_status`] !== 1) {
      return res.status(400).send({
        message: findMiniConfigs[`${game}_${minute}_close_message`],
      });
    }

    const closeTime = moment
      .utc(findGame.start_datetime)
      .add(minute, "minutes")
      .subtract(findMiniConfigs[`${game}_${minute}_close_time`], "seconds")
      .format("YYYY-MM-DD HH:mm:ss");
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    if (now > closeTime) {
      return res.status(400).send({
        message: "베팅이 마감되었습니다",
      });
    }

    minBetAmount =
      findUser["mini_min_bet_amount"] ?? findMiniConfigs["min_bet_amount"];

    maxBetAmount =
      findUser["mini_max_bet_amount"] ?? findMiniConfigs["max_bet_amount"];

    if (minBetAmount > amount) {
      return res.status(400).send({
        message: `최소 베팅 금액은 ${commaNumber(minBetAmount)}원입니다`,
      });
    }

    if (maxBetAmount < amount) {
      return res.status(400).send({
        message: `최대 베팅 금액은 ${commaNumber(maxBetAmount)}원입니다`,
      });
    }

    if (findUser.balance < amount) {
      return res.status(400).send({
        message: "보유금액이 부족합니다",
      });
    }

    const findHistoryCount = await MiniBetHistory.count({
      where: {
        username: req.username,
        game,
        minute,
        date_round: round,
        created_at: {
          [Op.between]: [
            moment().format("YYYY-MM-DD 00:00:00"),
            moment().format("YYYY-MM-DD 23:59:59"),
          ],
        },
      },
    });

    if (
      findMiniConfigs[`${game}_${minute}_max_bet_count`] <= findHistoryCount
    ) {
      return res.status(400).send({
        message: `동일 회차 최대 베팅수는 ${
          findMiniConfigs[`${game}_${minute}_max_bet_count`]
        }회입니다`,
      });
    }

    const findMiniBetType = await MiniBetType.findOne({
      where: {
        game,
        status: 1,
        type,
      },
    });

    if (!findMiniBetType) {
      return res.status(400).send({
        message: "존재하지 않는 베팅 타입입니다",
      });
    }

    // 양방베팅 체크
    const findTwoWayBetHistory = await MiniBetHistory.findOne({
      include: {
        model: MiniBetType,
        where: {
          type: {
            [Op.ne]: type,
          },
          market_type: findMiniBetType.market_type,
        },
      },
      where: {
        username: req.username,
        game,
        minute,
        date_round: round,
        created_at: {
          [Op.between]: [
            moment().format("YYYY-MM-DD 00:00:00"),
            moment().format("YYYY-MM-DD 23:59:59"),
          ],
        },
      },
    });

    if (findTwoWayBetHistory) {
      return res.status(400).send({
        message: "동일회차 양방향 베팅이 불가합니다",
      });
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

      const createHistoryData = {
        username: req.username,
        key,
        game,
        minute,
        date_round: round,
        date,
        start_datetime: moment
          .utc(findGame.start_datetime)
          .format("YYYY-MM-DD HH:mm:ss"),
        mini_bet_type_id: findMiniBetType.id,
        bet_amount: amount,
        odds: findMiniBetType.odds,
        prev_balance: findUser.balance,
        after_balance: findUser.balance - amount,
        created_ip: ip,
      };

      await MiniBetHistory.create(createHistoryData, {
        transaction: t,
      });

      // 배팅 머니로그
      const createBalanceLogData = {
        username: findUser.username,
        amount: -amount,
        system_note: `MINI ${key}`,
        admin_id: "시스템",
        created_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        updated_at: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
        record_type: "베팅",
        prev_balance: findUser.balance,
        after_balance: findUser.balance - amount,
        game_id: 'mini',
        game_category: 'minigame'
      };

      await BalanceLogs.create(createBalanceLogData, {
        transaction: t,
      });
    });

    return res.status(200).send({
      message: "베팅이 완료되었습니다",
    });
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
