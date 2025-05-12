const db = require("../../models");
const MiniGames = db.mini_games;
const MiniConfigs = db.mini_configs;
const MiniBetType = db.mini_bet_type;
const MiniBetHistory = db.mini_bet_history;
const Users = db.up_users;

const helpers = require("../../helpers");
const moment = require("moment");

exports.getNextRoundForUser = async (req, res) => {
  const { game, minute } = req.query;

  try {
    const findLastGame = await MiniGames.findOne({
      where: {
        game,
        minute,
        is_result: 1,
      },
      order: [["start_datetime", "desc"]],
    });

    let nextDate;
    let nextDateRound;

    const conditionChecks = [
      { date_round: 288, minute: 5 },
      { date_round: 360, minute: 4 },
      { date_round: 480, minute: 3 },
      { date_round: 720, minute: 2 },
      { date_round: 1440, minute: 1 },
    ];

    const matchingCondition = conditionChecks.find(
      (condition) =>
        condition.date_round === findLastGame.date_round &&
        condition.minute === findLastGame.minute
    );

    if (matchingCondition) {
      nextDate = moment(findLastGame.date).add(1, "days").format("YYYY-MM-DD");
      nextDateRound = 1;
    } else {
      nextDate = findLastGame.date;
      nextDateRound = findLastGame.date_round + 1;
    }

    const findNextGame = await MiniGames.findOne({
      where: {
        game,
        minute,
        is_result: 0,
        date: nextDate,
        date_round: nextDateRound,
      },
    });

    const findMiniConfigs = await MiniConfigs.findOne();

    const closeTime = findMiniConfigs[`${game}_${minute}_close_time`];

    const findBetType = await MiniBetType.findAll({
      attributes: ["name", "odds", "type"],
      where: {
        game,
        status: 1,
      },
      order: [["order", "asc"]],
    });

    const returnData = {
      date: findNextGame.date,
      round: findNextGame.date_round,
      resultTime: moment
        .utc(findNextGame.start_datetime)
        .add(minute, "minutes")
        .format("YYYY-MM-DD HH:mm:ss"),
      closeTime: moment
        .utc(findNextGame.start_datetime)
        .add(minute, "minutes")
        .subtract(closeTime, "seconds")
        .format("YYYY-MM-DD HH:mm:ss"),
      betType: findBetType,
    };

    return res.status(200).send(returnData);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMiniBetHistoryForUser = async (req, res) => {
  const { page, size } = req.query;
  const { offset, limit } = helpers.getPagination(page, size);
  const condition = {
    is_delete: 0,
    username: req.username,
  };

  try {
    const findHistory = await MiniBetHistory.findAndCountAll({
      include: {
        attributes: ["name"],
        model: MiniBetType,
      },
      attributes: [
        "key",
        "game",
        "minute",
        "date_round",
        "date",
        "start_datetime",
        "status",
        "bet_amount",
        "win_amount",
        "odds",
        "created_at",
      ],
      where: condition,
      offset,
      limit,
      order: [["created_at", "desc"]],
    });

    const data = helpers.getPagingData(findHistory, page, limit);

    return res.status(200).send(data);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};

exports.getMiniConfigForUser = async (req, res) => {
  try {
    const config = {
      min_bet_amount: 0,
      max_bet_amount: 0,
      max_win_amount: 0,
    };

    const findUser = await Users.findOne({
      where: {
        username: req.username,
      },
    });

    const findMiniConfigs = await MiniConfigs.findOne();

    config.min_bet_amount =
      findUser["mini_min_bet_amount"] ?? findMiniConfigs["min_bet_amount"];

    config.max_bet_amount =
      findUser["mini_max_bet_amount"] ?? findMiniConfigs["max_bet_amount"];

    config.max_win_amount =
      findUser["mini_max_win_amount"] ?? findMiniConfigs["max_win_amount"];

    return res.status(200).send(config);
  } catch {
    return res.status(500).send({
      message: "Server Error",
    });
  }
};
